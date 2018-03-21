/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
 *    Fix the fact that we have to add a bogus precinct at the end
 *
 * node collectDataForASetOfPrecincts.js GibbsPrecincts 2016OH7Candidates voteTotalsForAllGibbsPrecictsAndCandidates
 *
 * Inputs
 *     GibbsPrecincts - A list of precincts in which Gibbs got at least one vote
 *     2016OH7Candidates - A list of candidates whose vote totals we are interested in 
 * Outputs
 *     voteTotalsForAllGibbsPrecictsAndCandidates - One line precinct with the
 *     vote totals for all candidates we are interested
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
    outputLine = entry.precinctID + "\n"; 
    writeOutput( outputLine ) ; 
}   



let precinctFileName = "GibbsPrecincts"
let candidateFileName = "GibbsCandidates"
let inputFileName = "Precinct2016All"
let outputFileName = "output" ;  



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
    if ( debugOutput ) { console.log('precinctFileName: ' + val); }
    precinctFileName = val;
  }
  if (index === 4) {
    if ( debugOutput ) { console.log('candidateFileName: ' + val); }
    candidateFileName = val;
  }
  if (index === 5) {
    if ( debugOutput ) { console.log('outputFileName: ' + val); }
    outputFileName = val;
  }
  
}
);

const writeVoteTotals = function( precinct, voteTotals) { 

    let outputLine = precinct; 
    for (let indexI=0;indexI<voteTotals.length;indexI++) {
       outputLine = outputLine + "," + voteTotals[indexI];
    }
    writeOutput(outputLine + "\n");
}


//initialization function
// Write file header
const init = function() {

  var inputFileContents = fs.readFileSync(inputFileName, 'utf8');
  var precinctFileContents = fs.readFileSync(precinctFileName, 'utf8');
  var candidateFileContents = fs.readFileSync(candidateFileName, 'utf8');

  var candidateLines = candidateFileContents.split("\n");
  var precinctLines = precinctFileContents.split("\n");
  let precincts = new sortedMap();  
  let candidates = new sortedMap();
  let header = "Precinct"; 
  for (indexI=1;indexI<candidateLines.length-1;indexI++) {
     candidates.set(candidateLines[indexI],indexI-1); 
     header = header + "," + candidateLines[indexI] ; 
  }
  writeOutput(header + "\n");

  for (indexI=1;indexI<precinctLines.length-1;indexI++) {
     precincts.set(precinctLines[indexI],1); 
  }
  let inputFileLines = inputFileContents.split("\n"); 
  let currentPrecinctName = "bogus";
  let voteTotals = [] ; 
  for (let indexJ=0;indexJ<candidateLines.length;indexJ++) {
      voteTotals[indexJ]="";
  }
  for (indexI=1;indexI<(inputFileLines.length);indexI++) {
      if (debugOutput) console.log(" this line = " + inputFileLines[indexI]+ "\n" );
      let splitRow = inputFileLines[indexI].split(',');
      let precinctID = splitRow[0] + splitRow[1] + splitRow[2];
      let voteCount = splitRow[7]; 
      if (debugOutput) { console.log("precinct name from input file:" + precinctID ); }
      //
      // This will ignore the last good precinct unless we add a bogus precinct
      // to the end of the file - let's do that for now
      //
      if (precincts.has(precinctID)) {
          candidate=splitRow[6];
          if (debugOutput) console.log("candidate name:" + candidate);
          if ( ( currentPrecinctName != precinctID ) ) {
              if ( ( currentPrecinctName != "bogus" ) && ( currentPrecinctName != precinctID ) ) {
                writeVoteTotals( currentPrecinctName, voteTotals ) ; 
              }
              for (let indexJ=0;indexJ<candidateLines.length;indexJ++) {
                  voteTotals[indexJ]="";
              }
              currentPrecinctName = precinctID ; 
          }
          if ( candidates.has(candidate) ) {
              voteTotals[candidates.get(candidate)] = voteCount; 
          }
      }
  }
//  parseLargeFile(inputFileContents) ;
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
