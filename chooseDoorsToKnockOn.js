/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
*    The format of a door will be: address,apt,zip
 *
 * Inputs
 *    MansfieldDemPrecincts.csv - created by downloading the doorsToAvoid data from the state website and running collectDemocraticMansfieldPrecincts.sh
 *    doorsToAvoid.csv - A list of doors to avoid 
 * 
 * Outputs:
 *    MansfieldDemDoors.csv - A list of doors to knock on 
 *
 * The basic concept here is that we don't knock on individual's doors, we knock on household's doors. 
 * I am not interested in knocking on a door with one Republican and one Dem. But, I will knock on a door of a household 
 * with more Dems than Reps. Not all Dems and Reps are created equal, so we score them. 
 */
debugOutput = false; 
const fs = require('fs');
const sortedMap = require("collections/sorted-map");  //  npm install collections

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};

const writeOneLine = (entry) => { 
    outputLine = entry.doorsToAvoidID + "\n"; 
    writeOutput( outputLine ) ; 
}   



let inputFileName = "MansfieldDemPrecincts.csv"
let doorsToAvoidFileName = "doorsToAvoid.csv" ;  
let outputFileName = "doorsToAvoid.csv" ;  


// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 4 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    if ( debugOutput ) { console.log('inputFileName: ' + val); }
    inputFileName = val;
  }
  if (index === 3) {
    if ( debugOutput ) { console.log('doorsToAvoidFileName: ' + val); }
    doorsToAvoidFileName = val;
  }
  if (index === 4) {
    if ( debugOutput ) { console.log('outputFileName: ' + val); }
    outputFileName = val;
  }
  
}
);

//initialization function
// Write file header
const init = function() {

  const addressPosition = 11;
  const aptPosition = 12; 
  const zipPosition = 15; 
  const general2012Pos = 85;
  const general2017Pos = 101; 

  var inputFileContents = fs.readFileSync(inputFileName, 'utf8');
  var doorsToAvoidFileContents = fs.readFileSync(doorsToAvoidFileName, 'utf8');

  var doorsToAvoidLines = doorsToAvoidContents.split("\n");
  doorsToAvoid = new sortedMap();  
  for (indexI=1;indexI<doorsToAvoidLines.length-1;indexI++) {
     doorsToAvoid.set(doorsToAvoidLines[indexI],1); 
  }
  inputFileLines = inputFileContents.split("\n"); 
  previousDoor = "bogus" ; 
  householdVoteScore = -13; 
  for (indexI=1;indexI<(inputFileLines.length);indexI++) {
      if (debugOutput) console.log(" this line = " + inputFileLines[indexI]+ "\n" );
      let splitRow = inputFileLines[indexI].split(',');
      let address = splitRow[addressPosition] ; 
      let apt = splitRow[aptPosition] ; 
      let zip = splitRow[zipPosition] ; 
      let door = address + "'" + apt + "," + zip ; A
      let demVotes = 0 ;
      let repVotes = 0 ; 
      let otherVotes = 0 ; 
      if ( door!=previousDoor ) {
        if ( householdVoteScore>0 ) {
          if ( !doorsToAvoid.has( previousDoor  ) writeOutput( previousDoor ) ; 
        }
        householdVoteScore = 0 ; 
        previousDoor = door ; 
      }
      for (indexI=general2012Pos; indexI<=general2017Pos; indexI++ ) { 
	if ( splitRow[indexI] === "D" ) demVotes++; 
	if ( splitRow[indexI] === "R" ) repVotes++; 
	if ( splitRow[indexI] === "X" ) otherVotes++; 
      }
      if ( repVotes > demVotes+1 ) {
         voterScore = -1.5;   // One strong Republican can be overcome by a strong Dem and a weak Dem
      } else if ( repVotes == demVotes+1 ) { 
         voterScore = -1;     // One weak Republican can be overcome by two weak Dems
      } else if ( demVotes > repVotes + 1 ) && ( demVotes+otherVotes > 3 ) ) {
         voterScore = 1 ;     // Strong Dem: At least four total votes, two presidentials and two primaries
      } else if ( demVotes >= repVotes + 1 ) {
         voterScore = .75 ;   // Weak Dem  
      } else {
         voterScore = .01 ;   // Independent - i.e. no primary record is a reason to knock on a door, but only if there are no Republicans in the household
      } 
      if (debugOutput) { console.log(" repVotes = " + repVotes + " demVotes = " + demVotes + " otherVotes = " + otherVotes + " voterScore = " + voterScore )  } 
      householdVoteScore+=voterScore; 
      if (debugOutput) { console.log(" householdVoteScore = " + householdVoteScore ; } 
  }
  headers = "Candidate Name\n" ;
  writeOutput(headers);
/*
  for (const [key, value] of candidates) {
        console.log(key, value);
  
  */

  candidatesAsArray = candidates.toArray();
  for (indexI=0;indexI<candidatesAsArray.length;indexI++) {
     writeOutput(candidatesAsArray[indexI]+"\n");
  }

};

init();
