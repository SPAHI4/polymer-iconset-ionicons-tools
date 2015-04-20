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

function parseFont(data) {
  var parser = new xml2js.Parser();
  var glyphs = [];

  var promise = new Promise(function (resolve, reject) {
    parser.parseString(data, function (err, result) {
      if (err) {
        reject(err);
      } else {
        result.svg.defs[0].font[0].glyph.forEach(function(g) {
          glyphs.push(g['$']);
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
        iconsetId: 'core-iconset-ionicons',
        defaultIconSize: '25',
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
var log  = console.log.bind(console);

getSvgFont(font)
  .then(parseFont, log)
  .then(renderElement, log)
  .then(log, log);
