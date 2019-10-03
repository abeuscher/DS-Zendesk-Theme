function findDirectoryMatch(collection, arr) {
    arr.pop();
    var output = collection.filter(f => {
                return f.srcDir == "./" + arr.join("/") + "/";
                });
    if (output.length > 0) {
        return output;
    } else if (arr.length > 1) {
        return findDirectoryMatch(arr);
    } else {
        console.log("Error processing " + path);
    }
}

module.exports = findDirectoryMatch;