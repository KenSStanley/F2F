/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
 *
 * Inputs
 * https://github.com/openelections/openelections-data-oh/tree/master/2016 
 *       20161108__oh__general__precinct.csv  cut and pasted into Precinct2016All
 e       output from ReadPrecinctFromStatePrecinctFile.js - GibbsPrecincts 
 * Outputs:
 *   A file containing a list of candidates who received votes in one of the
 *   precincts specified in GibbsPrecincts
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



let inputFileName = "Precinct2016All"
let outputFileName = "GibbsPrecincts" ;  


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
    if ( debugOutput ) { console.log('outputFileName: ' + val); }
    outputFileName = val;
  }
  
}
);

//initialization function
// Write file header
const init = function() {

  var inputFileContents = fs.readFileSync(inputFileName, 'utf8');
  var precinctFileContents = fs.readFileSync(precinctFileName, 'utf8');

  var precinctLines = precinctFileContents.split("\n");
  precincts = new sortedMap();  
  candidates = new sortedMap();
  for (indexI=1;indexI<precinctLines.length-1;indexI++) {
     precincts.set(precinctLines[indexI],1); 
//     console.log("precinct name from Precinct File:" + precinctLines[indexI]) ; 
  }
  inputFileLines = inputFileContents.split("\n"); 
  for (indexI=1;indexI<(inputFileLines.length);indexI++) {
      if (debugOutput) console.log(" this line = " + inputFileLines[indexI]+ "\n" );
      let splitRow = inputFileLines[indexI].split(',');
      let precinctID = splitRow[0] + splitRow[1] + splitRow[2];
      if (debugOutput) { console.log("precinct name from input file:" + precinctID ); }
      if (precincts.has(precinctID)) {
          candidate=splitRow[6];
          if (debugOutput) console.log("candistate name:" + candidate);
          candidates.set(candidate,candidate); 
      }
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
