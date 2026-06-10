const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const svg = fs.readFileSync('D:/Term Project MSI/kullanici-tipleri-usecase.svg','utf8');
const r = new Resvg(svg, {
  font: { fontDirs: ['C:/Windows/Fonts'], defaultFontFamily: 'Arial', loadSystemFonts: true },
  background: 'white'
});
const png = r.render().asPng();
fs.writeFileSync('img/usecase.png', png);
console.log('PNG bytes:', png.length);
