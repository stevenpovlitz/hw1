var fs = require('fs');
var csv = require('fast-csv');

let counter = 0;

// returns array containing csv data
// path must be a string of format 'filename.csv'
var importAsList = function(path) {
  let fileData = [];
  csv
    .fromPath(path)
    .on("data", function(data) {
      counter++;
      fileData.push(data);
    })
    .on("end", function() {
      // console.log("Done. counter at: " + counter);
      //call next function
      viewList(fileData);
    });
}

var viewList = function (list) {
  // for (var i = 0; i < list.length; i++) {
  //   console.log(list[i]);
  // }
  console.log(list[1]);
}

importAsList('spam_test.csv');
