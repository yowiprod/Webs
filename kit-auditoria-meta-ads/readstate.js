const fs=require('fs');let raw=fs.readFileSync(process.argv[2],'utf8');
raw=raw.replace(/^\s*\/\*[\s\S]*?\*\//,'');const j=JSON.parse(raw);
console.log(j.order.map(k=>`  ${k}: ${j.sections[k].disabled?'OFF':'ON'}`).join('\n'));