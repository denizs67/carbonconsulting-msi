const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const names = ['context','hierarchy','usecase_en','asis','tobe','er'];
for (const n of names) {
  const svg = fs.readFileSync(`svg/${n}.svg`,'utf8');
  const r = new Resvg(svg, { font: { fontDirs:['C:/Windows/Fonts'], defaultFontFamily:'Arial', loadSystemFonts:true }, background:'white', fitTo:{ mode:'width', value:1400 } });
  fs.writeFileSync(`img/${n}.png`, r.render().asPng());
  console.log(n,'OK');
}
