// Vectoriza el texto de los SVG usando opentype.js + fuentes TTF
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const tmpDir = __dirname;
const baseDir = path.resolve(tmpDir, '..');

function loadFont(file) {
  const buf = fs.readFileSync(path.join(tmpDir, file));
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return opentype.parse(ab);
}

// Cargar fuentes (estáticas para Bricolage, variable para Hanken)
const bric800 = loadFont('BricolageGrotesque-ExtraBold.ttf');
const bric700 = loadFont('BricolageGrotesque-Bold.ttf');
const hank    = loadFont('Hanken.ttf'); // variable, peso default

// Resolver fuente + letter-spacing (em, proporcional a fontSize) según la clase CSS
function resolveStyle(cls) {
  if (cls.includes('dtw'))    return { font: bric800, lsEm: -0.020 };
  if (cls.includes('brand'))  return { font: bric800, lsEm: -0.025 };
  if (cls.includes('name'))   return { font: bric800, lsEm: -0.020 };
  if (cls.includes('who'))    return { font: bric700, lsEm: -0.010 };
  if (cls.includes('talk'))   return { font: bric700, lsEm: -0.010 };
  if (cls.includes('nm'))     return { font: bric700, lsEm:  0     };
  if (cls.includes('lbl'))    return { font: hank,    lsEm:  0.18  };
  if (cls.includes('val'))    return { font: hank,    lsEm:  0     };
  if (cls.includes('slogan')) return { font: hank,    lsEm:  0     };
  return { font: hank, lsEm: 0 };
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

function advanceWidth(font, text, fontSize, lsEm) {
  const scale = fontSize / font.unitsPerEm;
  const ls = fontSize * lsEm;
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    const g = font.charToGlyph(text[i]);
    w += g.advanceWidth * scale;
    if (i < text.length - 1) w += ls;
  }
  return w;
}

function renderRuns(font, runs, fontSize, lsEm, x, y, anchor) {
  const scale = fontSize / font.unitsPerEm;
  const ls = fontSize * lsEm;
  const allChars = runs.map(r => r.text).join('');
  const totalW = advanceWidth(font, allChars, fontSize, ls);
  let startX = x;
  if (anchor === 'middle') startX = x - totalW / 2;
  else if (anchor === 'end') startX = x - totalW;

  let cursor = startX;
  const paths = [];
  for (const run of runs) {
    for (const ch of run.text) {
      const glyph = font.charToGlyph(ch);
      const p = glyph.getPath(cursor, y, fontSize);
      const d = p.toPathData(2);
      paths.push(`<path d="${d}" fill="${run.fill}"/>`);
      cursor += glyph.advanceWidth * scale + ls;
    }
  }
  return paths.join('');
}

function replaceText(match, attrs, content) {
  const get = (re) => (attrs.match(re) || [])[1];
  const x = parseFloat(get(/x="([^"]+)"/)) || 0;
  const y = parseFloat(get(/y="([^"]+)"/)) || 0;
  const fontSize = parseFloat(get(/font-size="([^"]+)"/)) || 16;
  const baseFill = get(/fill="([^"]+)"/) || '#000';
  const anchor = get(/text-anchor="([^"]+)"/) || 'start';
  const cls = get(/class="([^"]+)"/) || '';
  const { font, lsEm } = resolveStyle(cls);

  const runs = [];
  const tspanRe = /<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g;
  let last = 0, m;
  while ((m = tspanRe.exec(content)) !== null) {
    if (m.index > last) {
      const t = decodeEntities(content.slice(last, m.index));
      if (t) runs.push({ text: t, fill: baseFill });
    }
    const tFill = (m[1].match(/fill="([^"]+)"/) || [])[1] || baseFill;
    runs.push({ text: decodeEntities(m[2]), fill: tFill });
    last = m.index + m[0].length;
  }
  if (last < content.length) {
    const t = decodeEntities(content.slice(last));
    if (t) runs.push({ text: t, fill: baseFill });
  }
  if (runs.length === 0) runs.push({ text: decodeEntities(content), fill: baseFill });

  return `<g>${renderRuns(font, runs, fontSize, lsEm, x, y, anchor)}</g>`;
}

function processSvg(file) {
  let svg = fs.readFileSync(file, 'utf8');
  // Quitar el bloque <style> (con @import) ya que no haremos uso de la fuente externa
  svg = svg.replace(/<style>[\s\S]*?<\/style>/g, '');
  svg = svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (m, a, c) => replaceText(m, a, c));
  return svg;
}

const files = [
  'logo-destacamos-isotipo.svg',
  'logo-destacamos-oscuro.svg',
  'logo-destacamos-claro.svg',
  'tarjeta-destacamos-frente.svg',
  'tarjeta-destacamos-dorso.svg',
];

for (const name of files) {
  const p = path.join(baseDir, name);
  const out = processSvg(p);
  fs.writeFileSync(p, out);
  console.log('OK', name);
}
