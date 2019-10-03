var settings = require("../settings.js")();

const { src, dest, watch } = require('gulp');

var findDirMatch = require("./find-dir-match.js");

function moveFiles(cb) {
    var watcher = watch([settings.assets[0].srcDir + "*", settings.assets[0].srcDir + "**/*"]);
    moveFileset(settings.assets[0]);
    for (i=1;i<settings.assets.length;i++) {
        moveFileset(settings.assets[i]);
        watcher.add([settings.assets[i].srcDir + "*", settings.assets[i].srcDir + "**/*"]);
    }
    watcher.on("change", triggerMove);
    cb();
}
function triggerMove(path, stats) {
    // Parse the path
    var p = path.split("\\");
    var fileSet = findDirMatch(settings.assets,p);
    moveFileSet(fileSet[0]);
}
function moveFileset(f) {
    console.log("Moving file set " + f.name);
    src(f.srcDir)
    .pipe(dest(f.buildDir).on("end", function() { console.log("Finished Moving File set " + f.name)}));
}
module.exports = moveFiles;