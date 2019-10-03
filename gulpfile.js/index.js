var settings = require("../settings.js")();
var bundleJS = require("./bundle-js.js");
var processCss = require("./process-css.js");
var buildTemplates = require("./build-templates.js");
var moveFiles = require("./move-files.js");

var checkDir = require("./check-dir.js");

const { series, watch } = require('gulp');
function defaultTask(cb) {
    console.log("Begin processing " + settings.siteName);
    for (i=0;i<settings.directories.length;i++) {
      checkDir(settings.directories[i]);
    }
    cb();
  }
  
exports.default = series(defaultTask,bundleJS,processCss,buildTemplates, moveFiles);