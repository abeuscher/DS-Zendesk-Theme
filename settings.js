var srcDir = "./src/";
var buildDir = "./public_html/";

var jsSrcDir = srcDir + "js/";
var jsBuildDir = buildDir;

var templateSrcDir = srcDir + "templates/";

var sassSrcDir = srcDir + "scss/";
var sassBuildDir = buildDir;

var assetsSrcDir = srcDir + "public_transfer/";
var assetsBuildDir = buildDir;

var templateSrcDir = srcDir + "templates/";
var templateBuildDir = buildDir + "templates/";

var ukBuildDir = "app/public/wp-content/themes/ds-uk/";
var ukJsBuildDir = ukBuildDir + "js/";

function siteSettings() {
  return {
    siteName: "dynamicsignal.com",
    directories:[buildDir, jsBuildDir, ukBuildDir, ukJsBuildDir],
    jsFiles: [
      {
        name: "Main Bundle",
        srcDir: jsSrcDir,
        srcFileName: "app.js",
        buildDir: jsBuildDir,
        buildFileName: "script.js"
      }
    ],
    templates: [
      {
        name: "Main Template Group",
        srcDir: templateSrcDir,
        buildDir: templateBuildDir
      }
    ],
    stylesheets: [
      {
        name: "Main Stylesheet",
        srcDir: sassSrcDir,
        buildDir: sassBuildDir
      }
    ],
    assets: [
      {
        name: "Main Public Assets",
        srcDir: [assetsSrcDir + "**/*"],
        buildDir: assetsBuildDir
      }
    ]
  };
}
module.exports = siteSettings;
