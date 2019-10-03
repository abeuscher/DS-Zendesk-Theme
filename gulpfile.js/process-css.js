var settings = require("../settings.js")();

var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');

const { src, dest, watch } = require('gulp');

var findDirMatch = require("./find-dir-match.js");

function processCSS(cb) {
    var watcher = watch([settings.stylesheets[0].srcDir + "*.scss"]);
    buildCss(settings.stylesheets[0]);
    for (i=1;i<settings.stylesheets.length;i++) {
      buildCss(settings.stylesheets[i]);
      watcher.add([settings.stylesheets[i].srcDir + "*.scss"]);
    }
    watcher.on("change", triggerCss);
    cb();
}
function triggerCss(path, stats) {
  // Parse the path
  var p = path.split("\\");
  var thisSheet = findDirMatch(settings.stylesheets,p);
  buildCss(thisSheet[0]); 
}
function buildCss(s) {
  console.log("Processing Style sheet group " + s.name)
  src(s.srcDir + '*.scss')
  .pipe(sass({
    outputStyle: "compressed"
  }))
  .on('error', function(error) {
    console.log(error);
    this.emit('end');
  })
  .pipe(autoprefixer())
  .pipe(cssmin({
    keepSpecialComments: true
  }))
  .pipe(dest(s.buildDir).on("end", function() { console.log("Finished Processing stylesheet set " + s.name)}));
}

module.exports = processCSS;