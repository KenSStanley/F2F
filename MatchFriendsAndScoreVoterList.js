/**
 * Created by priyathg on 2/11/18.
 * Updated by Ken Stanley on 2/17/18 - Adding the ability to score all friends 
 *
 * TODO:
 *  Put the precinct, and organizers score in the output file - DONE 
 *  Make the precinct match work - DONE 
 *  Recalculate under40 and over70 - sanity check them 
 *  compute age match  - DONE 
 *  compute organizer's score - sanity check it 
 *  Misc cleanup add space to is??, eliminate stupid print outs - DONE 
 *  compute volunteer's score 
 *  
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
let precinctScore = 1; 
let precinctVol = "Unknown9Z";

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
  if ( index === 7 )  {
    console.log('Birth day ' + val);
    birthdate.setDate( val) ; 
    console.log('Birth date ' + birthdate);
  }
  if ( index === 8 )  {
    console.log('ward ' + val);
    ward = val ;
  }
  if ( index === 9 )  {
    console.log('PrecinctNum ' + val);
    precinctNum = val ;
  }
  if ( index === 10 )  {
    console.log('PrecinctLet ' + val);
    precinctLet = val ;
  }
  precinctVol = ward + " " + precinctNum + " - " + precinctLet ; 
  console.log('Precinct ' + precinctVol) ; 
});

//initialization function
// Write file header
const init = function() {
  console.log('Reading data from files..');
  readInput(largeFileName, parseLargeFile).then(()=>{
    return readInput(smallFileName, parseSmallFile)
  }).then(() => {
    let headers = 'ID,firstName(L),middleName(L),lastName(L),Age,Sex,Party,Address,Phone,City,State,Zip,ID_,Suffix,DOB,' +
      'precinct,knownBy,voteScore,under40,over70,hasPhone,is ' + precinctVol +' ?,bdate vs ' + birthdate + ',organizersScore,maxVoteScore,' +
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
      if (ID === 'SOS_VOTERID' && line === 0) continue;
      let firstName = splitRow[7].trim().toLowerCase().replace(/\r?\n?/g, '');
      let firstInitial = firstName ? firstName.charAt(0) : '';
      let middleName = splitRow[8].trim().toLowerCase().replace(/\r?\n?/g, '');
      let middleInitial = middleName ? middleName.charAt(0) : '';
      let lastName = splitRow[6].trim().toLowerCase().replace(/\r?\n?/g, '');
      let lastInitial = lastName ? lastName.charAt(0) : '';
      let age = 99;  
      let sex = 'U'; 
      let party = 'U'; 
      let address = splitRow[10].trim().replace(/\r?\n?/g, '');  // Name (Age) Address
      let phone = splitRow[3].trim().replace(/\r?\n?/g, '');
      let city = 'U';
      let state =  'OH';
      let zip = '99999';
      let id = splitRow[0].trim().replace(/\r?\n?/g, '');
      let suffix = splitRow[9].trim().replace(/\r?\n?/g, '');
      let date_of_birth = splitRow[11].trim().replace(/\r?\n?/g, '');
      let dob_split = date_of_birth.split("/");
      var dob = new Date(dob_split[2],dob_split[0],dob_split[1]);
      let precinct = splitRow[12].trim().replace(/\r?\n?/g, '');
      let knownBy = splitRow[16].trim().replace(/\r?\n?/g, '');
      let voteScore = splitRow[17].trim().replace(/\r?\n?/g, '');
      let under40 = splitRow[20].trim().replace(/\r?\n?/g, '');
      let over70 = splitRow[21].trim().replace(/\r?\n?/g, '');
      let hasPhone = splitRow[22].trim().replace(/\r?\n?/g, '');
      let organizersScore = splitRow[23].trim().replace(/\r?\n?/g, '');
      let maxVoteScore = splitRow[4].trim().replace(/\r?\n?/g, '');

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
        dob: dob,
        precinct: precinct,
        knownBy: knownBy,
        voteScore: voteScore,
        under40: under40,
        over70: over70,
        hasPhone: hasPhone,
        organizersScore: organizersScore,
        maxVoteScore: maxVoteScore
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
    // KSS - I don't see any value in a any single initial match on the last
    // name.
//  } else if ( name_large.charAt(0) === name_small.charAt(0)){
//    return (lastInitialFrequency[name_large.charAt(0)]/largeFile.length)*3;
  } else {
    return 9;  // Last names really ought to match
  }
};


const calculatePrecinctMatchScore = ( precinct_large, precinct_vol, precinct_score ) => {
  if ( precinct_large === precinct_vol ) {
     return precinct_score ;
  } else {
     return 0 ; 
  } 
};

const calculateAgeMatchScore = ( bdate_large, birthdate ) => {
    let dayDiff = ( bdate_large.getTime() - birthdate.getTime() ) / (24*60*60*1000) ; // getTime() returns milliseconds since Jan 1, 1970
/*
    console.log("bdate_large = ", bdate_large);
    console.log("birthdate= ",birthdate);
    console.log("dayDiff=",dayDiff);
    console.log("return = ", 1/Math.sqrt(Math.max(1,Math.abs(dayDiff/365.25)))); 
*/

    return 1/Math.sqrt(Math.max(1,Math.abs(dayDiff/365.25))); // 1 / sqrt( diff in age in years ) 
}

//this is where the processing takes place
const processData = function() {
  console.log('Processing data..');
  //Large file iteration
  let updatedLargeFile = largeFile.map((largeEntry) => {
    let {fName: fName_large, mName: mName_large, lName: lName_large, precinct: precinct_large, dob: dob_large} = largeEntry;
    let minScore = 999;
    let minScoreEntry = {};
    let minScoreBreakdown = {};

    //small file iteration
    smallFile.map((smallEntry) => {
      let {fName:fName_small, mName:mName_small, lName:lName_small} = smallEntry;
      let firstNameScore = calculateFirstNameScore(fName_large, fName_small);
      let middleNameScore = calculateMiddleNameScore(mName_large, mName_small);
      let lastNameScore = calculateLastNameScore(lName_large, lName_small);
      let baysian = (firstNameScore*middleNameScore*lastNameScore)*largeFile.length;
      let score = -Math.max(0,Math.log2(1/70/baysian)/1.25); 
      //keeping track of the min score, the corresponding entry and the score breakdown for this large file iteration
      if (score < minScore) {
        minScore = score;
        minScoreEntry = smallEntry;
        minScoreBreakdown = {firstNameScore: firstNameScore, middleNameScore: middleNameScore, lastNameScore: lastNameScore}
      }
    });
    let precinctMatchScore = calculatePrecinctMatchScore ( precinct_large, precinctVol, precinctScore );
    let ageMatchScore = calculateAgeMatchScore( dob_large, birthdate );
    
    return {ID: largeEntry.ID, fName_large: fName_large, mName_large: mName_large, lName_large: lName_large,
      age:largeEntry.age, sex:largeEntry.sex, party:largeEntry.party, address:largeEntry.address,
      phone:largeEntry.phone, city:largeEntry.city, state:largeEntry.state, zip:largeEntry.zip,
      id:largeEntry.id, suffix:largeEntry.suffix, dob:largeEntry.dob, fName_small: minScoreEntry.fName,
      mName_small: minScoreEntry.mName, lName_small: minScoreEntry.lName, firstNameScore: minScoreBreakdown.firstNameScore,
      middleNameScore: minScoreBreakdown.middleNameScore, lastNameScore:minScoreBreakdown.lastNameScore, finalScore: minScore,
      precinct:largeEntry.precinct, knownBy:largeEntry.knownBy, voteScore:largeEntry.voteScore, under40:largeEntry.under40, over70:largeEntry.over70, 
      hasPhone:largeEntry.hasPhone, precinctMatchScore:precinctMatchScore, ageMatchScore:ageMatchScore, 
      organizersScore:largeEntry.organizersScore, maxVoteScore:largeEntry.maxVoteScore  
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
      entry.precinct + ',' + entry.knownBy + ',' + entry.voteScore + ',' + entry.under40 + ',' + entry.over70 + ',' + 
      entry.hasPhone + ',' + entry.precinctMatchScore + ',' + entry.ageMatchScore + ',' +
      entry.organizersScore + ',' + 
      entry.maxVoteScore + ',' + 
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
