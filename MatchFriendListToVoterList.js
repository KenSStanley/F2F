/**
 * Created by priyathg on 2/11/18.
 */
const fs = require('fs');

let largeFile = [];
let smallFile = [];

let firstNameFrequency = {};
let firstInitialFrequency = {};
let middleNameFrequency = {};
let middleInitialFrequency = {};
let lastNameFrequency = {};
let lastInitialFrequency = {};

let largeFileName = 'LargeFile';
let smallFileName = 'SmallFile';
let outputFileName = 'output';
var birthdate = new Date();
birthdate.setFullYear(2020, 0, 14);
let ward = "MAN"
let precinctNum = 9;
let precinctLet = "Z";

// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 2 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    console.log('large file: ' + val);
    largeFileName = val;
  }
  if (index === 3) {
    console.log('small file: ' + val);
    smallFileName = val;
  }
  if (index === 4) {
    console.log('output file: ' + val);
    outputFileName = val;
  }
  if (index === 5 ) { 
    console.log('Birth year ' + val);
    birthdate.setFullYear(val) ;
  }
  if ( index === 6 )  {
    console.log('Birth month ' + val);
    birthdate.setMonth( val-1) ; 
  }
  console.log('Birth date ' + birthdate);
  if ( index === 7 )  {
    console.log('ward ' + val);
    ward = val ;
  }
  if ( index === 8 )  {
    console.log('PreicinctNum ' + val);
    precinctNum = val ;
  }
  if ( index === 9 )  {
    console.log('PrecinctLet ' + val);
    precinctLet = val ;
  }
  let precinct = ward + " " + precinctNum + " - " + precinctLet ; 
  console.log('Precinct ' + precinct) ; 
});

//initialization function
const init = function() {
  console.log('Reading data from files..');
  readInput(largeFileName, parseLargeFile).then(()=>{
    return readInput(smallFileName, parseSmallFile)
  }).then(() => {
    let headers = 'ID,firstName(L),middleName(L),lastName(L),Age,Sex,Party,Address,Phone,City,State,Zip,ID_,Suffix,DOB,' +
      'firstName(S),middleName(S),lastName(S),firstNameScore,middleNameScore,lastNameScore,finalScore\n';
    writeOutput(headers);
    processData();
  }).catch((e) => {
    console.log("Promise Rejected: ", e);
  });
};

//function to read input from specified path
const readInput = function (path, parsingFunction) {
  return new Promise(function(resolve, reject){
    fs.readFile(path + '.csv', 'utf8', function(err, data) {
      if (err) {
        console.log('Error reading name list from large file');
        reject(err);
      } else {
        parsingFunction(data);
        resolve();
      }
    });
  })
};

//function to parse the large file and store name details to memory
const parseLargeFile = function(data) {
  let rows = data.split("\n");
  //iterate each line and parse the data
  for (let line = 0; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
      let ID = splitRow[0].trim().replace(/\r?\n?/g, '');
      if (ID === 'ID' && line === 0) continue;
      let firstName = splitRow[1].trim().toLowerCase().replace(/\r?\n?/g, '');
      let firstInitial = firstName ? firstName.charAt(0) : '';
      let middleName = splitRow[3].trim().toLowerCase().replace(/\r?\n?/g, '');
      let middleInitial = middleName ? middleName.charAt(0) : '';
      let lastName = splitRow[4].trim().toLowerCase().replace(/\r?\n?/g, '');
      let lastInitial = lastName ? lastName.charAt(0) : '';
      let age = splitRow[5].trim().replace(/\r?\n?/g, '');
      let sex = splitRow[6].trim().replace(/\r?\n?/g, '');
      let party = splitRow[7].trim().replace(/\r?\n?/g, '');
      let address = splitRow[8].trim().replace(/\r?\n?/g, '');
      let phone = splitRow[9].trim().replace(/\r?\n?/g, '');
      let city = splitRow[10].trim().replace(/\r?\n?/g, '');
      let state = splitRow[11].trim().replace(/\r?\n?/g, '');
      let zip = splitRow[12].trim().replace(/\r?\n?/g, '');
      let id = splitRow[13].trim().replace(/\r?\n?/g, '');
      let suffix = splitRow[14].trim().replace(/\r?\n?/g, '');
      let dob = splitRow[15].trim().replace(/\r?\n?/g, '');

      let nameObject = {
        ID: ID,
        fName: firstName,
        fInitial: firstInitial,
        mName: middleName,
        mInitial: middleInitial,
        lName: lastName,
        lInitial: lastInitial,
        age: age,
        sex: sex,
        party: party,
        address: address,
        phone: phone,
        city: city,
        state: state,
        zip: zip,
        id: id,
        suffix: suffix,
        dob: dob
      };
      updateFrequencies(nameObject);
      largeFile.push(nameObject);
    }
  }
};

//function to parse the small file and store name details to memory
const parseSmallFile = function(data) {
  let rows = data.split("\n");
  //iterate each line and parse the data
  for (let line = 0; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
      let firstName = splitRow[1].trim().toLowerCase().replace(/\r?\n?/g, '');
      let firstInitial = firstName ? firstName.charAt(0) : '';
      let middleName = splitRow[2].trim().toLowerCase().replace(/\r?\n?/g, '');
      let middleInitial = middleName ? middleName.charAt(0) : '';
      let lastName = splitRow[3].trim().toLowerCase().replace(/\r?\n?/g, '');
      let lastInitial = lastName ? lastName.charAt(0) : '';

      let nameObject = {fName: firstName, fInitial: firstInitial, mName: middleName, mInitial: middleInitial, lName: lastName, lInitial: lastInitial};
      smallFile.push(nameObject);
    }
  }
};

//update frequency of occurrences of each name and initial
const updateFrequencies = (nameObject) => {
  let {fName, fInitial, mName, mInitial, lName, lInitial} = nameObject;

  if (firstNameFrequency.hasOwnProperty(fName)) {
    firstNameFrequency[fName] += 1;
  } else {
    firstNameFrequency[fName] = 1;
  }

  if (firstInitialFrequency.hasOwnProperty(fInitial)) {
    firstInitialFrequency[fInitial] += 1;
  } else {
    firstInitialFrequency[fInitial] = 1;
  }

  if (middleNameFrequency.hasOwnProperty(mName)) {
    middleNameFrequency[mName] += 1;
  } else {
    middleNameFrequency[mName] = 1;
  }

  if (middleInitialFrequency.hasOwnProperty(mInitial)) {
    middleInitialFrequency[mInitial] += 1;
  } else {
    middleInitialFrequency[mInitial] = 1;
  }

  if (lastNameFrequency.hasOwnProperty(lName)) {
    lastNameFrequency[lName] += 1;
  } else {
    lastNameFrequency[lName] = 1;
  }

  if (lastInitialFrequency.hasOwnProperty(lInitial)) {
    lastInitialFrequency[lInitial] += 1;
  } else {
    lastInitialFrequency[lInitial] = 1;
  }
};

const calculateFirstNameScore = (name_large, name_small) => {
  if  (name_large === name_small) {
    return firstNameFrequency[name_large]/largeFile.length;
  } else if ( name_large.charAt(0) === name_small.charAt(0)){
    return firstInitialFrequency[name_large.charAt(0)]/largeFile.length;
  } else {
    return 1;
  }
};

const calculateMiddleNameScore = (name_large, name_small) => {
  if  (!name_large && !name_small) {
    return 1/25;
  } else if (!name_large || !name_small){
    return 1/12;
  } else if ( name_large === name_small){
    return middleNameFrequency[name_large]/largeFile.length;
  } else if (name_large.charAt(0) === name_small.charAt(0)){
    return middleInitialFrequency[name_large.charAt(0)]/largeFile.length;
  } else {
    return 1/3;
  }
};

const calculateLastNameScore = (name_large, name_small) => {
  if  (name_large === name_small) {
    return lastNameFrequency[name_large]/largeFile.length;
    // KSS - I don't see any value in a any single initial math on the last
    // name.
//  } else if ( name_large.charAt(0) === name_small.charAt(0)){
//    return (lastInitialFrequency[name_large.charAt(0)]/largeFile.length)*3;
  } else {
    return 9;  // Last names really ought to match
  }
};

//this is where the processing takes place
const processData = function() {
  console.log('Processing data..');
  //Large file iteration
  let updatedLargeFile = largeFile.map((largeEntry) => {
    let {fName: fName_large, mName: mName_large, lName: lName_large} = largeEntry;
    let minScore = 999;
    let minScoreEntry = {};
    let minScoreBreakdown = {};

    //small file iteration
    smallFile.map((smallEntry) => {
      let {fName:fName_small, mName:mName_small, lName:lName_small} = smallEntry;
      let firstNameScore = calculateFirstNameScore(fName_large, fName_small);
      let middleNameScore = calculateMiddleNameScore(mName_large, mName_small);
      let lastNameScore = calculateLastNameScore(lName_large, lName_small);
      let score = (firstNameScore*middleNameScore*lastNameScore)*largeFile.length;

      //keeping track of the min score, the corresponding entry and the score breakdown for this large file iteration
      if (score < minScore) {
        minScore = score;
        minScoreEntry = smallEntry;
        minScoreBreakdown = {firstNameScore: firstNameScore, middleNameScore: middleNameScore, lastNameScore: lastNameScore}
      }
    });
    return {ID: largeEntry.ID, fName_large: fName_large, mName_large: mName_large, lName_large: lName_large,
      age:largeEntry.age, sex:largeEntry.sex, party:largeEntry.party, address:largeEntry.address,
      phone:largeEntry.phone, city:largeEntry.city, state:largeEntry.state, zip:largeEntry.zip,
      id:largeEntry.id, suffix:largeEntry.suffix, dob:largeEntry.dob, fName_small: minScoreEntry.fName,
      mName_small: minScoreEntry.mName, lName_small: minScoreEntry.lName, firstNameScore: minScoreBreakdown.firstNameScore,
      middleNameScore: minScoreBreakdown.middleNameScore, lastNameScore:minScoreBreakdown.lastNameScore, finalScore: minScore
    };
      //console.log('large entry: ' + JSON.stringify(largeEntry));
      //console.log('minScoreEntry: ' + JSON.stringify(minScoreEntry) + '\n' + 'min score: ' + minScore + '\n' + 'minScorebreakdown: ' + JSON.stringify(minScoreBreakdown) + '\n');
  });

  //write output to csv
  updatedLargeFile.sort(compare);
  writeOutput(updatedLargeFile.map((entry) => {
    return entry.ID + ',' + entry.fName_large + ',' + entry.mName_large + ',' + entry.lName_large + ',' +
      entry.age + ',' + entry.sex + ',' + entry.party + ',' + entry.address + ',' + entry.phone + ',' + entry.city + ',' +
      entry.state + ',' + entry.zip + ',' + entry.id + ',' + entry.suffix + ',' + entry.dob + ',' +
      entry.fName_small + ',' + entry.mName_small + ',' + entry.lName_small + ',' + entry.firstNameScore + ',' +
      entry.middleNameScore + ',' + entry.lastNameScore + ',' + entry.finalScore + '\n';
  }).join(""));
  console.log('All completed. Check ' + outputFileName + ' for results');
};

const compare = (a,b) => {
  return (a.finalScore - b.finalScore)
};

const writeOutput = (text) => {
  fs.appendFile(outputFileName + '.csv', text, (err) => {
    if (err) throw err;
  });
};

init();
