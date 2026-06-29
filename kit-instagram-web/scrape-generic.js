const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const HANDLE = process.argv[2] || 'sandraperruquers';
const FOLDER = process.argv[3] || HANDLE;
const OUT = path.join(__dirname, 'assets', FOLDER);
const LOCAL = process.env.LOCALAPPDATA || 'C:\\Users\\Montse\\AppData\\Local';
const SRC = path.join(LOCAL, 'Google', 'Chrome', 'User Data');
const TMP = path.join(__dirname, '.chrome-session');

function cp(a,b){ try{ if(fs.existsSync(a)){ fs.copyFileSync(a,b); return true; } }catch(e){} return false; }
function dl(url, dest){return new Promise(r=>{const f=fs.createWriteStream(dest);https.get(url,{headers:{'User-Agent':'Mozilla/5.0'}},res=>{if(res.statusCode!==200){f.close();fs.unlink(dest,()=>{});return r(false);}res.pipe(f);f.on('finish',()=>f.close(()=>r(true)));}).on('error',()=>{f.close();fs.unlink(dest,()=>{});r(false);});});}

(async()=>{
  if(!fs.existsSync(OUT)) fs.mkdirSync(OUT,{recursive:true});
  fs.rmSync(TMP,{recursive:true,force:true});
  fs.mkdirSync(path.join(TMP,'Default','Network'),{recursive:true});
  cp(path.join(SRC,'Local State'), path.join(TMP,'Local State'));
  for(const f of ['Cookies','Cookies-journal','Cookies-wal']) cp(path.join(SRC,'Default','Network',f), path.join(TMP,'Default','Network',f));
  cp(path.join(SRC,'Default','Cookies'), path.join(TMP,'Default','Cookies'));

  const ctx = await chromium.launchPersistentContext(TMP, { channel:'chrome', headless:true, viewport:{width:1280,height:1600} });
  const page = ctx.pages()[0] || await ctx.newPage();
  const out = { handle:HANDLE };
  let netUser = null;
  page.on('response', async (resp)=>{
    const url = resp.url();
    if(url.includes('web_profile_info') || url.includes('graphql')){
      try{ const j = await resp.json(); const u = j && j.data && j.data.user; if(u && u.edge_owner_to_timeline_media) netUser = u; }catch(e){}
    }
  });
  try{
    await page.goto('https://www.instagram.com/'+HANDLE+'/', { waitUntil:'domcontentloaded', timeout:60000 });
    await page.waitForTimeout(7000);
    for(let i=0;i<6;i++){ await page.mouse.wheel(0,1400); await page.waitForTimeout(1800); }

    const meta = await page.evaluate(()=>{
      const g = (p)=>{ const el=document.querySelector('meta[property="'+p+'"]'); return el?el.content:null; };
      return { ogTitle:g('og:title'), ogDesc:g('og:description'), ogImage:g('og:image'), title:document.title };
    });
    out.meta = meta;

    // If network sniffing didn't grab the profile JSON, fetch it in-page (session is warm now).
    if(!netUser){
      for(let attempt=0; attempt<4 && !netUser; attempt++){
        const fetched = await page.evaluate(async (h)=>{
          try{
            const r = await fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username='+h, {
              headers:{ 'x-ig-app-id':'936619743392459', 'x-requested-with':'XMLHttpRequest', 'accept':'*/*' },
              credentials:'include'
            });
            if(r.status!==200) return {status:r.status};
            const j = await r.json();
            return {status:200, user:j && j.data && j.data.user};
          }catch(e){ return {err:String(e).slice(0,120)}; }
        }, HANDLE);
        if(fetched && fetched.user && fetched.user.edge_owner_to_timeline_media){ netUser = fetched.user; }
        else { out.fetchTry = (out.fetchTry||[]).concat(fetched && fetched.status || fetched && fetched.err); await page.waitForTimeout(3000); }
      }
    }

    const imgs = await page.evaluate(()=>{
      const arr=[];
      document.querySelectorAll('img').forEach(im=>{
        const s=im.src||''; const alt=im.alt||''; const w=im.naturalWidth||im.width;
        if(s && (s.includes('fbcdn') || s.includes('cdninstagram')) && w>=200) arr.push({src:s, alt:alt.slice(0,300), w});
      });
      return arr;
    });
    const seen=new Set(); out.allImages = imgs.filter(o=>{ if(seen.has(o.src)) return false; seen.add(o.src); return true; });
    out.imgCount = out.allImages.length;

    if(netUser){
      out.fullName=netUser.full_name; out.biography=netUser.biography;
      out.followers=netUser.edge_followed_by&&netUser.edge_followed_by.count;
      out.following=netUser.edge_follow&&netUser.edge_follow.count;
      out.postsCount=netUser.edge_owner_to_timeline_media&&netUser.edge_owner_to_timeline_media.count;
      out.category=netUser.category_name; out.external=netUser.external_url; out.isPrivate=netUser.is_private;
      const edges=(netUser.edge_owner_to_timeline_media&&netUser.edge_owner_to_timeline_media.edges)||[];
      out.captions = edges.map(e=>{ const c=e.node&&e.node.edge_media_to_caption&&e.node.edge_media_to_caption.edges[0]; return c?c.node.text.slice(0,300):''; }).filter(Boolean);
    }

    // high-res profile pic from netUser if available, else ogImage
    const hdPic = netUser && (netUser.profile_pic_url_hd || netUser.profile_pic_url);
    if(hdPic){ out.profileSaved = await dl(hdPic, path.join(OUT,'profile.jpg')); }
    else if(meta.ogImage){ out.profileSaved = await dl(meta.ogImage, path.join(OUT,'profile.jpg')); }

    // PREFER full-res display_url from the post nodes (1080px). Fallback to grid thumbs.
    let hdUrls = [];
    if(netUser && netUser.edge_owner_to_timeline_media){
      hdUrls = netUser.edge_owner_to_timeline_media.edges.map(e=>{
        const nd=e.node; if(!nd) return null;
        // for carousels grab the first child's display_url too; node.display_url is the cover (full res)
        return nd.display_url || nd.thumbnail_src;
      }).filter(Boolean);
    }
    out.hdCount = hdUrls.length;

    let sources;
    if(hdUrls.length){
      sources = hdUrls.map(u=>({src:u, w:1080}));
    } else {
      const baseSeen=new Set();
      sources = out.allImages.filter(i=>i.w>=240).sort((a,b)=>b.w-a.w).filter(i=>{ const b=i.src.split('?')[0]; if(baseSeen.has(b)) return false; baseSeen.add(b); return true; });
    }

    out.saved=[]; let n=0;
    for(const im of sources){
      n++; if(n>12) break;
      const ok = await dl(im.src, path.join(OUT,'post-'+n+'.jpg'));
      if(ok) out.saved.push({file:'post-'+n+'.jpg', w:im.w});
    }
    out.downloaded = out.saved.length;
  }catch(e){ out.error=String(e.message).slice(0,300); }
  fs.writeFileSync(path.join(__dirname,'ig-data-'+FOLDER+'.json'), JSON.stringify(out,null,2));
  console.log(JSON.stringify({handle:out.handle, folder:FOLDER, ogTitle:out.meta&&out.meta.ogTitle, ogDesc:out.meta&&out.meta.ogDesc, bio:out.biography, category:out.category, external:out.external, imgCount:out.imgCount, downloaded:out.downloaded, alts:(out.saved||[]).map(s=>s.alt), captions:out.captions, error:out.error},null,2));
  await ctx.close();
  fs.rmSync(TMP,{recursive:true,force:true});
})();
