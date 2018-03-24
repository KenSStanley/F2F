/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
 *
 * Inputs:
 *   Output from
 *       https://github.com/openelections/openelections-data-oh/tree/master/2016 
 *       20161108__oh__general__precinct.csv  cut and pasted into Precinct2016All
 e       grep -i gibbs Precinct2016All | grep -v ",0"   >Precinct2016Gibbs 
 * Outputs:
 *   A file containing a list of precinct identifiers that Gibbs recieved votes from 
 */
debugOutput = true; 
const fs = require('fs');

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};

const writeOneLine = (entry) => { 
    outputLine = entry.precinctID + "\n"; 
    writeOutput( outputLine ) ; 
}   



let inputFileName = "Precinct2016Gibbs"
let outputFileName = "outputFile" ;  

//function to parse the large file and store name details to memory
const parseLargeFile = function(data) {
  let rows = data.split("\n");
  //iterate each line and parse the data
  for (let line = 0; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
 
      let precinctID = splitRow[0] + splitRow[1] + splitRow[2]; 

      let nameObject = {
        precinctID: precinctID,
      };
      writeOneLine( nameObject ) ; 
    }
  }
};


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
    if ( debugOutput ) { console.log('outputFileName: ' + val); }
    outputFileName = val;
  }
  
}
);

//initialization function
// Write file header
const init = function() {

  var inputFileContents = fs.readFileSync(inputFileName, 'utf8');


  headers = "PrecinctID\n" ;
  writeOutput(headers);
  parseLargeFile(inputFileContents) ; 

};

init();
