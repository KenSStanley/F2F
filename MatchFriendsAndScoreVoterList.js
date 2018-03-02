/**
 * Created by priyathg on 2/11/18.
 * Updated by Ken Stanley on 2/17/18 - Adding the ability to score all friends from a Facebook friend list
 *
 * TODO:
 *  compute age match  - DONE 
 *  compute organizer's score - sanity check it 
 *  compute volunteer's score 
 *  clean up the way that birthdates are printed
 *  
 */
const fs = require('fs');

var debugOutput = false; 
var longOutput = true; 

let largeFile = [];
let smallFile = [];

let firstNameFrequency = {};
let firstInitialFrequency = {};
let middleNameFrequency = {};
let middleInitialFrequency = {};
let lastNameFrequency = {};
let lastInitialFrequency = {};

let logMultiplier = 1/10;   // this is basically the minimum friend score (pre Log) that it takes to get any friend points
let logDivider = 2;         // this controls how quickly you ramp up to being considered 100% likely to be a friend
let maxFriendScore = 1.25;  // This is the most that you can get for being a friend
let largeFileName = 'LargeFile';
let smallFileName = 'SmallFile';
let outputFileName = 'output';
var birthdate = new Date(2017,0,1,0,0,0);
birthdate.setFullYear(2020, 0, 14);
let ward = "MAN"
let precinctNum = 9;
let precinctLet = "Z";
let precinctScore = 1; 
let precinctVol = "Unknown9Z";
let Feb18_18 = new Date(2018,1,18); // We use this date instead of today to calculate age to make the regression test easy
let maxVoteScoreAllowed = 1 ; // KSS added this so that we could prioritize a voteScore for Sierra without giving her a bunch of older people
var voteScoreWeight = 1; 
var precinctMatchWeight = 1; 
var ageMatchWeight = 1 ;
var under40Weight = .075 ;
var over70Weight = -0.05 ; 
var hasPhoneWeight = 1.5 ; 
var knownByWeight = -0.25  ;  // should be -1 
var precinctScoreWeight = 1 ; 
var F2Fweight = -1 ; // -1 if we have a true friends list

const printDate = function( d ) { 
  return d.getMonth()+1 + '/' + d.getDate() + '/' + d.getFullYear() ;
}

// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 2 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    if ( debugOutput ) { console.log('large file: ' + val); }
    largeFileName = val;
  }
  if (index === 3) {
    if ( debugOutput ) { console.log('small file: ' + val); } 
    smallFileName = val;
  }
  if (index === 4) {
    if ( debugOutput ) { console.log('output file: ' + val); }
    outputFileName = val;
  }
  if (index === 5 ) { 
    if ( debugOutput ) { console.log('Birth year ' + val); }
    birthdate.setFullYear(val) ;
  }
  if ( index === 6 )  {
    if ( debugOutput ) { console.log('Birth month ' + val); }
    birthdate.setMonth( val-1) ; 
  }
  if ( index === 7 )  {
    if ( debugOutput ) { console.log('Birth day ' + val); }
    birthdate.setDate( val) ; 
    console.log('Birth date ' + birthdate);
  }
  if ( index === 8 )  {
    if ( debugOutput ) { console.log('ward ' + val); }
    ward = val ;
  }
  if ( index === 9 )  {
    if ( debugOutput ) { console.log('PrecinctNum ' + val); }
    precinctNum = val ;
  }
  if ( index === 10 )  {
    if ( debugOutput ) { console.log('PrecinctLet ' + val); }
    precinctLet = val ;
  }
 if ( index === 11 )  {
    if ( true ) { console.log('voteScoreWeight ' + val); }
    voteScoreWeight = val ;
  }
 if ( index === 12 )  {
    if ( true ) { console.log('maxVoteScoreAllowed ' + val); }
    maxVoteScoreAllowed = val ;
  }
 if ( index === 13 )  {
    if ( true ) { console.log('ageMatchWeight ' + val); }
    ageMatchWeight = val ;
  }
 if ( index === 14 )  {
    if ( true ) { console.log('under40Weight ' + val); }
    under40Weight = val ;
  }
 if ( index === 15 )  {
    if ( true ) { console.log('over70Weight ' + val); }
    over70Weight = val ;
  }
 if ( index === 16 )  {
    if ( true ) { console.log('hasPhoneWeight ' + val); }
    hasPhoneWeight = val ;
  }
 if ( index === 17 )  {
    if ( true ) { console.log('precinctScoreWeight ' + val); }
    precinctScoreWeight = val ;
  }
 if ( index === 18 )  {
    { console.log('F2Fweight ' + val); }
    F2Fweight = val ;
  }
 if ( index === 19 )  {
    if ( true ) { console.log('precinctMatchWeight ' + val); }
    precinctMatchWeight = val ;
  }
 if ( index === 20 )  {
    if ( true ) { console.log('knownByWeight ' + val); }
    knownByWeight = val ;
  }
 if ( index === 21 )  {
    longOutput = true ;
    if ( val == 0 ) {
      longOutput = false ;
    }
    if ( true ) { console.log('val =' + val + 'longOutput = ' + longOutput ); }
  }
  
  precinctVol = ward + " " + precinctNum + " - " + precinctLet ; 

}
);

//initialization function
// Write file header
const init = function() {
  console.log('Reading data from files..');
  readInput(largeFileName, parseLargeFile).then(()=>{
    return readInput(smallFileName, parseSmallFile)
  }).then(() => {
    let headers = 'ID, Phone, Name (Age) Address, Score \n';
  console.log('Precinct ' + precinctVol) ; 
  console.log('Birthdate' + printDate(birthdate) );
    if ( longOutput ) {
      headers = 'ID,firstName(L),middleName(L),lastName(L),Age,Sex,Party,Address,Phone,City,State,Zip,ID_,Suffix,DOB,' +
        'precinct,knownBy,precinctScore,voteScore,under40,over70,hasPhone,is ' + precinctVol +' ?,bdate vs ' + printDate(birthdate) + ',organizersScore,maxVoteScore,' +
        'firstName(S),middleName(S),lastName(S),firstNameScore,middleNameScore,lastNameScore,finalScore\n';
    }
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
      let precinctScore = splitRow[13].trim().replace(/\r?\n?/g, '');
      let knownBy = splitRow[16].trim().replace(/\r?\n?/g, '');
      let voteScore = splitRow[17].trim().replace(/\r?\n?/g, '');
      let under40 = splitRow[20].trim().replace(/\r?\n?/g, '');
      let over70 = splitRow[21].trim().replace(/\r?\n?/g, '');
      let hasPhone = splitRow[22].trim().replace(/\r?\n?/g, '');
      let organizersScore = splitRow[23].trim().replace(/\r?\n?/g, '');
      let maxVoteScore = splitRow[4].trim().replace(/\r?\n?/g, '');  // This is from the old idea that volunteers,i.e. those asking people to vote 
                                                                     // less interested in a high vote score than organizers, i.e. those asking for volunteers

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
        precinctScore: precinctScore,
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


const calculatePrecinctMatchScore = ( precinct_large, precinct_vol ) => {
  if ( precinct_large === precinct_vol ) {
     return 1 ;
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


const calculateUnder40Score = ( bdate_large ) => {
    let dayDiff = ( Feb18_18 - bdate_large.getTime() ) / (24*60*60*1000) ; // getTime() returns milliseconds since Jan 1, 1970

    return Math.min(Math.max(0,40 - dayDiff/365.25 ),15);  
}

const calculateOver70Score = ( bdate_large ) => {
    let dayDiff = ( Feb18_18 - bdate_large.getTime() ) / (24*60*60*1000) ; // getTime() returns milliseconds since Jan 1, 1970

    return Math.max(0, dayDiff/365.25 - 70 );  
}
const calculateOrganizersScore = ( precinctScore, ageMatchScore, under40, over70, 
    precinctMatchScore, voteScore, hasPhone, knownBy, F2Fscore ) => { 
     if ( debugOutput ) { console.log("voteScoreWeight = " + voteScoreWeight + 
	" voteScore = " + voteScore + 
	" precinctScoreWeight = " + precinctScoreWeight + 
	" precinctScore = " + precinctScore + 
	" ageMatchWeight = " + ageMatchWeight + 
	" ageMatchScore = " + ageMatchScore + 
 "" ) ;      } 
    return voteScoreWeight * Math.min(voteScore,maxVoteScoreAllowed) + precinctMatchWeight * precinctMatchScore + ageMatchWeight * ageMatchScore + 
           under40Weight * under40 + over70Weight * over70 + hasPhoneWeight * hasPhone + 
           precinctScoreWeight * precinctScore + knownByWeight * knownBy + F2Fscore * F2Fweight; 
};   


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
      let bayesian = (firstNameScore*middleNameScore*lastNameScore)*largeFile.length;
      let score = -Math.min(maxFriendScore,Math.max(0,Math.log2(logMultiplier/bayesian)/logDivider)); 
      //keeping track of the min score, the corresponding entry and the score breakdown for this large file iteration
      if (score < minScore) {
        minScore = score;
        minScoreEntry = smallEntry;
        minScoreBreakdown = {firstNameScore: firstNameScore, middleNameScore: middleNameScore, lastNameScore: lastNameScore}
      }
    });
    let precinctMatchScore = calculatePrecinctMatchScore ( precinct_large, precinctVol );
    let ageMatchScore = calculateAgeMatchScore( dob_large, birthdate );
    let newUnder40score = calculateUnder40Score( dob_large );
    let newOver70score = calculateOver70Score( dob_large );

// const calculateOrganizersScore = ( precinctScore, ageMatchScore, under40, over70, 
//    precinctMatchScore, voteScore, hasPhone, knownBy ) => { 
  if ( debugOutput ) {  console.log( " largeEntry.precinctScore = " + largeEntry.precinctScore ) ; }
    let newOrganizersScore = 0 - calculateOrganizersScore( largeEntry.precinctScore, ageMatchScore, largeEntry.under40, largeEntry.over70, 
        precinctMatchScore, largeEntry.voteScore, largeEntry.hasPhone, largeEntry.knownBy, minScore ); 
/*
    console.log("newUnder40score = " + newUnder40score );
  console.log("largeEntry.under40 = " + largeEntry.under40 );
*/
if ( false ) { 
    console.assert( Math.abs(newUnder40score - largeEntry.under40) < 1 , "The new under40 score is messed up" + newUnder40score + " old: " + largeEntry.under40) ; 
    console.assert( Math.abs(newOver70score - largeEntry.over70) < 0.1 , "The new over70 score is " + newOver70score + 
      " should be closer to " + largeEntry.over70 ) ; 
}
/*
    console.assert( Math.abs( newOrganizersScore - largeEntry.organizersScore ) < .05 , "The new organizers score is: " +
      newOrganizersScore + "Should be: " + largeEntry.organizersScore + "\n fName_large = " + fName_large + 
      "\n precinctScore = " + precinctScore + 
      "\n ageMatchScore = " + ageMatchScore + 
      "\n largeEntry.under40 = " + largeEntry.under40 + 
      "\n largeEntry.over70 = " + largeEntry.over70 + 
      "\n precinctMatchScore = " + precinctMatchScore + 
      "\n largeEntry.voteScore = " + largeEntry.voteScore + 
      "\n largeEntry.hasPhone = " + largeEntry.hasPhone + 
      "\n" );
*/
 
    return {ID: largeEntry.ID, fName_large: fName_large, mName_large: mName_large, lName_large: lName_large,
      age:largeEntry.age, sex:largeEntry.sex, party:largeEntry.party, address:largeEntry.address,
      phone:largeEntry.phone, city:largeEntry.city, state:largeEntry.state, zip:largeEntry.zip,
      id:largeEntry.id, suffix:largeEntry.suffix, dob:largeEntry.dob, fName_small: minScoreEntry.fName,
      mName_small: minScoreEntry.mName, lName_small: minScoreEntry.lName, firstNameScore: minScoreBreakdown.firstNameScore,
      middleNameScore: minScoreBreakdown.middleNameScore, lastNameScore:minScoreBreakdown.lastNameScore, finalScore: minScore,
      precinct:largeEntry.precinct, precinctScore:largeEntry.precinctScore, knownBy:largeEntry.knownBy, voteScore:largeEntry.voteScore, under40:largeEntry.under40, over70:largeEntry.over70, 
      hasPhone:largeEntry.hasPhone, precinctMatchScore:precinctMatchScore, ageMatchScore:ageMatchScore, 
      organizersScore:newOrganizersScore, maxVoteScore:largeEntry.maxVoteScore  
    };
      //console.log('large entry: ' + JSON.stringify(largeEntry));
      //console.log('minScoreEntry: ' + JSON.stringify(minScoreEntry) + '\n' + 'min score: ' + minScore + '\n' + 'minScorebreakdown: ' + JSON.stringify(minScoreBreakdown) + '\n');
  });

  //write output to csv
  updatedLargeFile.sort(compare);
  writeOutput(updatedLargeFile.map((entry) => {
    if ( longOutput ) { 
    return entry.ID + ',' + entry.fName_large + ',' + entry.mName_large + ',' + entry.lName_large + ',' +
      entry.age + ',' + entry.sex + ',' + entry.party + ',' + entry.address + ',' + entry.phone + ',' + entry.city + ',' +
      entry.state + ',' + entry.zip + ',' + entry.id + ',' + entry.suffix + ',' + entry.dob + ',' +
      entry.precinct + ',' + entry.knownBy + ',' + entry.precinctScore + ',' + entry.voteScore + ',' + entry.under40 + ',' + entry.over70 + ',' + 
      entry.hasPhone + ',' + entry.precinctMatchScore + ',' + entry.ageMatchScore + ',' +
      entry.organizersScore + ',' + 
      entry.maxVoteScore + ',' + 
      entry.fName_small + ',' + entry.mName_small + ',' + entry.lName_small + ',' + entry.firstNameScore + ',' +
      entry.middleNameScore + ',' + entry.lastNameScore + ',' + entry.finalScore + '\n'; 
     } else {
      return entry.ID + ',' + entry.phone + ',' + entry.address + ',' + -entry.organizersScore.toFixed(2) + '\n' ;
     }
  }).join(""));
  console.log('All completed. Check ' + outputFileName + ' for results');
};

const compare = (a,b) => {
  return (a.organizersScore - b.organizersScore)   // was finalscore 
};

const writeOutput = (text) => {
  fs.appendFile(outputFileName + '.csv', text, (err) => {
    if (err) throw err;
  });
};

init();
