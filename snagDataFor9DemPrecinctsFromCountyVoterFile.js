/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
 *
 * Inputs:
 *   County download file    aka RICHLAND.txt
 * Outputs:
 *   Header and records of all voters under the age of 23 on April 13, 2018 
 */
debugOutput = true; 
const fs = require('fs');

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};


     const sosIdPosition = 0 ; 
     const lastNamePosition = 3 ; 
     const firstNamePosition =4; 
     const middleNamePosition = 5 ; 
     const bdayPosition = 7;
     const voterStatusPosition = 9; 
     const precinctPosition = 38; 
  const addressPosition = 11;
  const aptPosition = 12; 
  const zipPosition = 15; 
  const primary2012Pos = 84;
  const general2017Pos = 101; 

let inputFileName = "MansfieldDemPrecincts.csv";
let outputFileName = "MansfieldDemPrecinctsFewerColumns.csv" ;  

//function to parse the large file and store name details to memory
const parseLargeFile = function(data) {
 
  let rows = data.split("\n");
  let outputData = " sosId , lastName , firstName, middleName , address , apt , zip , door , demVotes , repVotes , otherVotes, PRIMARY-03/06/2012,GENERAL-11/06/2012,PRIMARY-05/07/2013,PRIMARY-09/10/2013,PRIMARY-10/01/2013,GENERAL-11/05/2013,PRIMARY-05/06/2014,GENERAL-11/04/2014,PRIMARY-05/05/2015,PRIMARY-09/15/2015,GENERAL-11/03/2015,PRIMARY-03/15/2016,GENERAL-06/07/2016,PRIMARY-09/13/2016,GENERAL-11/08/2016,PRIMARY-05/02/2017,PRIMARY-09/12/2017,GENERAL-11/07/2017\n";

  //iterate each line and parse the data
  for (let line = 1; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
      let sosId = splitRow[sosIdPosition];
      let lastName = splitRow[lastNamePosition];
      let firstName = splitRow[firstNamePosition];
      let middleName = splitRow[middleNamePosition];
      let address = splitRow[addressPosition] ; 
      let apt = splitRow[aptPosition] ; 
      let zip = splitRow[zipPosition] ; 
      let door = address + " " + apt   ; 
      let demVotes = 0 ;
      let repVotes = 0 ; 
      let otherVotes = 0 ; 

      
      let outputline = sosId + "," + lastName  + "," + firstName  + "," + middleName  + "," + address  + "," + apt  + "," + zip  + "," + door  + "," + demVotes + "," + repVotes + "," + otherVotes ;

      for (indexJ=primary2012Pos; indexJ<=general2017Pos; indexJ++ ) { 
          outputline = outputline + "," +  splitRow[indexJ] ; 
	if ( splitRow[indexJ].includes("D" )) demVotes++; 
	if ( splitRow[indexJ].includes( "R") ) repVotes++; 
	if ( splitRow[indexJ].includes("X" ) ) otherVotes++; 
      }


          outputData = outputData + outputline + "\n"; 
      
    }
  }
  writeOutput( outputData ) ; 
};


// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 3 && index == 0) {
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


  parseLargeFile(inputFileContents) ; 

};

init();
