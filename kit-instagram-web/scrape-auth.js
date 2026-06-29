const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const HANDLE = process.argv[2] || 'matperruquers';
const OUT = path.join(__dirname, 'assets', 'instagram');
const LOCAL = process.env.LOCALAPPDATA || 'C:\\Users\\Montse\\AppData\\Local';
const SRC = path.join(LOCAL, 'Google', 'Chrome', 'User Data');
const TMP = path.join(__dirname, '.chrome-session');

function cp(a,b){ try{ if(fs.existsSync(a)){ fs.copyFileSync(a,b); return true; } }catch(e){} return false; }
function dl(url, dest){return new Promise(r=>{const f=fs.createWriteStream(dest);https.get(url,res=>{if(res.statusCode!==200){f.close();fs.unlink(dest,()=>{});return r(false);}res.pipe(f);f.on('finish',()=>f.close(()=>r(true)));}).on('error',()=>{f.close();fs.unlink(dest,()=>{});r(false);});});}

(async()=>{
  if(!fs.existsSync(OUT)) fs.mkdirSync(OUT,{recursive:true});
  fs.rmSync(TMP,{recursive:true,force:true});
  fs.mkdirSync(path.join(TMP,'Default','Network'),{recursive:true});
  cp(path.join(SRC,'Local State'), path.join(TMP,'Local State'));
  for(const f of ['Cookies','Cookies-journal','Cookies-wal']) cp(path.join(SRC,'Default','Network',f), path.join(TMP,'Default','Network',f));
  cp(path.join(SRC,'Default','Cookies'), path.join(TMP,'Default','Cookies'));

  const ctx = await chromium.launchPersistentContext(TMP, { channel:'chrome', headless:true, viewport:{width:1280,height:1000} });
  const page = ctx.pages()[0] || await ctx.newPage();
  const out = { handle:HANDLE };
  try{
    // establish instagram.com origin so cookies attach
    await page.goto('https://www.instagram.com/', { waitUntil:'domcontentloaded', timeout:45000 });
    await page.waitForTimeout(2500);

    const api = 'https://www.instagram.com/api/v1/users/web_profile_info/?username='+HANDLE;
    const r = await ctx.request.get(api, { headers:{
      'x-ig-app-id':'936619743392459',
      'x-requested-with':'XMLHttpRequest',
      'referer':'https://www.instagram.com/'+HANDLE+'/',
      'accept':'*/*'
    }});
    out.status = r.status();
    let j=null; try{ j = await r.json(); }catch(e){ out.parseErr=String(e.message).slice(0,120); out.rawHead=(await r.text()).slice(0,160); }
    const u = j && j.data && j.data.user;
    if(u){
      out.fullName = u.full_name;
      out.biography = u.biography;
      out.followers = u.edge_followed_by && u.edge_followed_by.count;
      out.following = u.edge_follow && u.edge_follow.count;
      out.postsCount = u.edge_owner_to_timeline_media && u.edge_owner_to_timeline_media.count;
      out.category = u.category_name;
      out.external = u.external_url;
      out.isPrivate = u.is_private;
      // profile pic
      const pic = u.profile_pic_url_hd || u.profile_pic_url;
      if(pic){ out.profileSaved = await dl(pic, path.join(OUT,'profile-mat.jpg')); }
      // media
      const edges = (u.edge_owner_to_timeline_media && u.edge_owner_to_timeline_media.edges) || [];
      out.mediaFound = edges.length;
      out.saved=[]; out.captions=[];
      let n=0;
      for(const e of edges){
        const nd=e.node; if(!nd) continue;
        const url = nd.display_url || nd.thumbnail_src;
        if(!url) continue;
        n++; if(n>12) break;
        const ok = await dl(url, path.join(OUT,'post-'+n+'.jpg'));
        if(ok){ out.saved.push('post-'+n); const cap = nd.edge_media_to_caption && nd.edge_media_to_caption.edges[0] && nd.edge_media_to_caption.edges[0].node.text; out.captions.push((cap||'').slice(0,80)); }
      }
      out.downloaded = out.saved.length;
    } else {
      out.note='sin data.user (status '+out.status+')';
    }
  }catch(e){ out.error=String(e.message).slice(0,200); }
  console.log(JSON.stringify(out,null,2));
  await ctx.close();
  fs.rmSync(TMP,{recursive:true,force:true});
})();
