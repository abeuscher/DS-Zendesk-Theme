var fs = require("file-system");

function checkDir(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  module.exports = checkDir;