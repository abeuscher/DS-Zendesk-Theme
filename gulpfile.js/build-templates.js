var settings = require("../settings.js")();

var pug = require("gulp-pug");
var pugPhpFilter = require("pug-php-filter");
var extReplace = require("gulp-ext-replace");

const { src, dest, watch } = require("gulp");

function BuildTemplates(cb) {
  // This starts the watch function, assuming there is one set of templates to work with
  var watcher = watch([
    settings.templates[0].srcDir + "*.pug",
    settings.templates[0].srcDir + "**/*.pug"
  ]);
  buildTemplate(settings.templates[0]);

  // Loop through the template sets, build them for the first time, and add them to the watcher.
  for (i = 1; i < settings.templates.length; i++) {
    buildTemplate(settings.templates[i]);
    watcher.add([
      settings.templates[i].srcDir + "*.pug",
      settings.templates[i].srcDir + "**/*.pug"
    ]);
  }

  // Attach the listener function to the watcher
  watcher.on("change", triggerTemplate);
  cb();
}
function triggerTemplate(path, stats) {

  // Parse the path
  var p = path.split("\\");
  var templateSet = findFile(p);
  
  // Function to recursively try to match the path with the template set. This will be a problem is I need nested source tempalte directories,
  // But I can't think of when I would need that.
  function findFile(arr) {
    arr.pop();
    var output = settings.templates.filter(f => {
      return f.srcDir == "./" + arr.join("/") + "/";
    });
    if (output.length > 0) {
      return output;
    } else if (arr.length > 1) {
      return findFile(arr);
    } else {
      console.log("Error processing " + path);
    }
  }

  // Build the template after it is matched or else the thing errors out, which I think is right?
  buildTemplate(templateSet[0]);
}

// Template builder
function buildTemplate(t) {
  console.log("Begin processing template set " + t.name);
  src(t.srcDir + "*.pug")
    .pipe(
      pug({
        pretty: false,
        filters: {
          php: pugPhpFilter
        },
        extension: "php",
        locals: {
          siteurl: ""
        }
      })
    )
    .pipe(extReplace(".php"))
    .pipe(
      dest(t.buildDir).on("end", function() {
        console.log("Finished processing template set " + t.name);
      })
    );
}
module.exports = BuildTemplates;
