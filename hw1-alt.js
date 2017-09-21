var fs = require('fs'); // interact with file system
var euclidean = require( 'compute-euclidean-distance' ); // calculate euclidean quickly

// will refactor these to parse from command line later
var trainingPath = 'spam_train.csv';
var testPath = 'spam_test.csv';

// synchronously read in and return the contents of a CSV file located
// in the same file
var readSync = function(path) {
  var dataarr = []
  var fileContents = fs.readFileSync(path);//expects 'data.csv' format
  var lines = fileContents.toString().split('\n');

  for (var i = 0; i < lines.length; i++) {
    dataarr.push(lines[i].toString().split(','));
  }

  return (dataarr);
}

// determine the euclidean distances from all records in file1 to
// record1, then push this distance to an array that will be returned
// beware, pushing an empty first val to avoid off by one error when
// comparing distances to a csv file's array
var calcDistance = function(file1, record1) {
  var distances = []; // will be returned
  for (var i = 1; i < file1.length; i++) {
    distances.push([i, euclidean(file1[i], record1)]);
  }
  return distances;
}

// sorts a distance array based on length (second value)
var sortDistance = function(a, b) {
  return a[1] - b[1];
}

// based on a kval and a sorted distances array and the classification,
// chose which classification we should get
var voteClassification = function(trainingData, distances, kval){
  if (kval % 2 == 0) {
    console.log('WARNING: KVAL IS EVEN');
  }
  var spamvotes = 0;
  var notspamvotes = 0;
  for (var i = 1; i <= kval; i++) {
    var temp = parseInt(trainingData[distances[i][0]][trainingData[0].length-1]);
    // console.log("temp is: " + (temp));
    if (temp === 0) {
      notspamvotes++;
    } else {
      spamvotes++;
    }
  }
  if (spamvotes < notspamvotes) {
    // console.log('not spam');
    return 0;
  } else if (spamvotes > notspamvotes) {
    // console.log('spam');
    return 1;
  } else {
    // console.log('err - even kval and same votes');
    return 2;
  }
}

// run classification for every record in trainingdata against all of
// testdata
var classifyWholeSet = function(testData, trainingData, kval) {
  console.log('each \'=\' is 10% completion');
  process.stdout.write('(');
  var spam = 0;
  var notspam = 0;
  for (var i = 1; i < trainingData.length; i++) {
    var distances = calcDistance(testData, trainingData[i]);
    distances.sort(sortDistance);
    var tempresult = voteClassification(trainingData, distances, kval);
    if (tempresult == 0) {
      notspam++;
    } else {
      spam++;
    }
    if (i % parseInt(trainingData.length / 10) == 0) {
      process.stdout.write('=');
    }
  }
  process.stdout.write(')\n');
  console.log("total spam: " + spam + "\ntotal nspam: " + notspam);
}

// get both files into memory as arrays
var testData = readSync(trainingPath);
var trainingData = readSync(testPath);
classifyWholeSet(testData, trainingData, 5);
