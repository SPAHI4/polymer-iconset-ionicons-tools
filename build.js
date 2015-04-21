var jade   = require('jade');
var http   = require('https');
var fs     = require('fs');
var xml2js = require('xml2js');


function getSvgFont(font) {
  var promise = new Promise(function(resolve, reject) {
    http.get(font, function(res) {
      var result = "";
      res.on('data', function (data) {
        result += data.toString();
      });
      res.on('end', function () {
        resolve(result);
      });
    }).on('error', function(e) {
      reject(e);
    });
  });
  return promise;
}

var defaultWidth = 512;

function formatGlyph (glyph) {
  var scale = 1;
  var xMargin = 0;

  if (glyph['horiz-adv-x']) {
    var customWidth = parseInt(glyph['horiz-adv-x']);

    if (customWidth < defaultWidth) {
      xMargin = (defaultWidth - customWidth) / 2;
    }

    if (customWidth > defaultWidth) {
      scale = defaultWidth / customWidth;
    }
  }

  glyph.xMargin = xMargin;
  glyph.scale = scale;
  glyph.name = glyph['glyph-name'];

  return glyph;
}

function parseFont(data) {
  var parser = new xml2js.Parser();
  var glyphs = [];

  var promise = new Promise(function (resolve, reject) {
    parser.parseString(data, function (err, result) {
      if (err) {
        reject(err);
      } else {
        result.svg.defs[0].font[0].glyph.forEach(function(g) {
          var g = formatGlyph(g['$']);
          // console.log('core-icon(icon="ion:' + g.name + '")')
          glyphs.push(g);
        });
        resolve(glyphs);
      }
    });
  });
  return promise;
}

function renderElement(locals) {
  var tpl = jade.compileFile(__dirname + '/tpl/element.jade', { pretty: true });

  var promise = new Promise(function (resolve, reject) {
    try {
      var res = tpl({
        iconsetId: 'ion',
        defaultIconSize: defaultWidth,
        glyphs: locals
      });
      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
  return promise;
}


var font = "https://raw.githubusercontent.com/driftyco/ionicons/master/fonts/ionicons.svg";
var onError = console.error.bind(console);

getSvgFont(font)
  .then(parseFont)
  .catch(onError)
  .then(renderElement)
  .catch(onError)
  .then(console.log.bind(console));
