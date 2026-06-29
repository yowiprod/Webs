const fs = require('fs');
const path = require('path');
const https = require('https');

const d = require('./ig-data.json');
const OUT_DIR = path.join(__dirname, 'assets', 'instagram');

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { file.close(); fs.unlink(dest, () => {}); return resolve(false); }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(true)));
    }).on('error', () => { file.close(); fs.unlink(dest, () => {}); resolve(false); });
  });
}

(async () => {
  // Post images: width >= 240 (the 311 grid), skip the 150 avatars
  const posts = (d.allImages || []).filter(i => i.src && i.w >= 240 && i.src.includes('fbcdn'));
  const seen = new Set();
  let n = 0;
  const saved = [];
  for (const im of posts) {
    if (seen.has(im.src)) continue;
    seen.add(im.src);
    n++;
    const dest = path.join(OUT_DIR, `post-${n}.jpg`);
    const ok = await download(im.src, dest);
    if (ok) saved.push(`assets/instagram/post-${n}.jpg`);
    if (n >= 12) break;
  }
  console.log('Downloaded', saved.length, 'post images');
  saved.forEach(s => console.log(s));
})();
