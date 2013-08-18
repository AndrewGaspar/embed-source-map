var embed = require("../embed-source-map.js");
var fs = require("fs");

embed.overwriteFile("A.js", function (err) {
    if (err) return console.log(err);
});