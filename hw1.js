// TODO:
// -have import statements passed in command line parameters
// -get sorting working with euclidean distance


var fs = require('fs');
var csv = require('fast-csv');

// returns array containing csv data
// path must be a string of format 'filename.csv'
var importAsList = function(path) {
  let fileData = [];
  csv
    .fromPath(path)
    .on("data", function(data) {
      fileData.push(data);
    })
    .on("end", function() {
      // console.log("Done. counter at: " + counter);
      //call next function

      calcDistance(fileData);
    });
}

var calcDistance = function(fileData) {
  var distances = [];
  for (let i = 1; i < fileData.length; i++) {
    distances.push([i]);
    let nextDist = 0;
    for (let j = 1; j < fileData[i].length-1; j++) {
      nextDist+=parseInt(fileData[i][j]);
    }
    distances[i-1].push(nextDist);
  }
  distances.sort(distCalc);
  decideOnDistance(fileData, distances);
}

var distCalc = function (el1, el2) {
  return el1[1] - el2[1];
}

// index 0 for not spam count, index 1 for spam count
var decideOnDistance = function(fileData, distances, kchose = 3) {
  let votes = [0,0];
  for (var i = 0; i < kchose; i++) {
    //console.log("secondary distance: " + distances[i][0].length-1);
    let tempnext = parseInt(fileData[distances[i][0]][parseInt(fileData[distances[i][0]].length-1)]);
    console.log(tempnext + '\n');
    votes[tempnext]++;
  }
  console.log("votes (not spam, spam):\n"+votes);
  return Math.max(votes[0], votes[1]);
}


var viewList = function (list) {
  for (var i = 0; i < 10; i++) {
    //console.log(list[i]);
  }
  // console.log(list);
}

var trainingPath = 'spam_train.csv';
var testPath = 'spam_test.csv';

importAsList(trainingPath);
