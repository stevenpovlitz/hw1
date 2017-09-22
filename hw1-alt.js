var fs = require('fs'); // interact with file system
var euclidean = require( 'compute-euclidean-distance' ); // calculate euclidean quickly

var arr = {
	max: function(array) {
		return Math.max.apply(null, array);
	},

	min: function(array) {
		return Math.min.apply(null, array);
	},

	range: function(array) {
		return arr.max(array) - arr.min(array);
	},

	midrange: function(array) {
		return arr.range(array) / 2;
	},

	sum: function(array) {
		var num = 0;
		for (var i = 0, l = array.length; i < l; i++) num += array[i];
		return num;
	},

	mean: function(array) {
		return arr.sum(array) / array.length;
	},

	median: function(array) {
		array.sort(function(a, b) {
			return a - b;
		});
		var mid = array.length / 2;
		return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
	},

	modes: function(array) {
		if (!array.length) return [];
		var modeMap = {},
			maxCount = 0,
			modes = [];

		array.forEach(function(val) {
			if (!modeMap[val]) modeMap[val] = 1;
			else modeMap[val]++;

			if (modeMap[val] > maxCount) {
				modes = [val];
				maxCount = modeMap[val];
			}
			else if (modeMap[val] === maxCount) {
				modes.push(val);
				maxCount = modeMap[val];
			}
		});
		return modes;
	},

	variance: function(array) {
		var mean = arr.mean(array);
		return arr.mean(array.map(function(num) {
			return Math.pow(num - mean, 2);
		}));
	},

	standardDeviation: function(array) {
		return Math.sqrt(arr.variance(array));
	},

	meanAbsoluteDeviation: function(array) {
		var mean = arr.mean(array);
		return arr.mean(array.map(function(num) {
			return Math.abs(num - mean);
		}));
	},

	zScores: function(array) {
		var mean = arr.mean(array);
		var standardDeviation = arr.standardDeviation(array);
		return array.map(function(num) {
			return (num - mean) / standardDeviation;
		});
	}
};

// 'spam_train.csv', 'spam_test.csv'
var trainingPath = process.argv[2] || 'spam_train.csv';
var testPath = process.argv[3] || 'spam_test.csv';

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
var calcDistance = function(record1, file1) {
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
    console.log('WARNING: KVAL IS EVEN: ' + kval);
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
  // console.log('each \'=\' is 10% completion');
  // process.stdout.write('[');
  var spam = 0;
  var notspam = 0;
  var truespam = 0; // used for computing accuracies
  for (var i = 1; i < testData.length; i++) {
    var distances = calcDistance(testData[i], trainingData);
    distances.sort(sortDistance);
    var tempresult = voteClassification(trainingData, distances, kval);

    truespam += parseInt(trainingData[i][parseInt(trainingData[0].length-1)]);
    if (tempresult == 0) {
      notspam++;
    } else {
      spam++;
    }
    if (i % parseInt(trainingData.length / 10) == 0) {
      // process.stdout.write('=');
    }
  }
  // process.stdout.write(']\n');
	// 401: 233 wrong, 233/2301*100 = 10.126
  // console.log("spam: " + spam + " truespam: " + truespam  + " difference: " + Math.abs(parseInt(spam - truespam)));
  var wrong = Math.abs(spam - truespam);
	process.stdout.write(wrong + " wrong, " + parseFloat(wrong) + "/2301*100 = " + (wrong)/2301*100);
}

var useZScore = function (dataFile) {
	var converts = [];
	for (var i = 1; i < dataFile[0].length-2; i++) {
		for (var j = 1; j < dataFile.length; j++){
			converts.push(parseFloat(dataFile[j][i]));
		}
		converts = arr.zScores(converts)
		for (var j = 1; j < dataFile.length; j++){
			dataFile[j][i] = converts[j-1];
		}
	}
  return dataFile;
}

// get both files into memory as arrays
var testData = readSync(trainingPath);
var trainingData = readSync(testPath);
var tests = [1, 5, 11, 21, 41, 61, 81, 101, 201, 401];
tests.forEach(function(i) {
  // if (i > 2) {return;}
  // console.log('\ni val: ' + i);
  // console.log(useZScore(testData));
  process.stdout.write("\n" + parseInt(i) + ": ");
  classifyWholeSet( useZScore(testData), useZScore(trainingData), i);
});
