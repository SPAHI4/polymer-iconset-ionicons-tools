var jade   = require('jade');
var http   = require('https');
var fs     = require('fs');
var xml2js = require('xml2js');


var font = "https://raw.githubusercontent.com/driftyco/ionicons/master/fonts/ionicons.svg";

function getSvgFont() {
  http.get(font, function(res) {
    var src = fs.createWriteStream('./src.svg');
    res.on('data', src.write.bind(src));

    console.log("Got response: " + res.statusCode);
  }).on('error', function(e) {
    console.log("GET: " + font);
    console.log("Cannot download ionicon webfont: " + e.message);
  });
}

function compileTemplate(locals) {
  var tpl = jade.compileFile(__dirname + '/tpl/element.jade', { pretty: true });

  var res = tpl({
    iconsetId: 'core-iconset-ionicons',
    defaultIconSize: '25',
    glyphs: locals
  });
  console.log(res);
  return res;
}

function withGlyphs(cb) {
  var parser = new xml2js.Parser();
  var glyphs = [];

  fs.readFile(__dirname + '/src.svg', function(err, data) {
    parser.parseString(data, function (err, result) {
      result.svg.defs[0].font[0].glyph.forEach(function(g) {
        glyphs.push(g['$']);
      })
    });
    cb(glyphs)
  });
}

console.log(withGlyphs(compileTemplate));
