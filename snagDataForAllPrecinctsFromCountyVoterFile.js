/**
 * Created by Ken Stanley on 3/20/18 - 
 *  Modified 28 JUNE 18 
 *
 * TODO:
 *
 * Inputs:
 *   The Mansfield precincts from the County download file    aka MansfieldAllPrecincts.csv
 * Outputs:
 *   A few columns for all Mansfield precincts
 */
debugOutput = true; 
under22only = false; 
const fs = require('fs');

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};


     const sosIdPosition = 0 ; 
     const lastNamePosition = 3 ; pr13_18 = new Date(2018,4,13);

let Apr13_18 = new Date(2018,4,13); 

const calculateUnder22 = ( bdate ) => {
    let dayDiff = ( Apr13_18 - bdate.getTime() ) / (24*60*60*1000) ; // getTime() returns milliseconds since Jan 1, 1970
 
//    console.log( " bdate.getTime() = " , bdate.getTime(), " dayDiff = " , dayDiff ) ;

    return ( (22 - dayDiff/365.25) > 0 ) ;
}
  

     const firstNamePosition =4; 
     const middleNamePosition = 5 ; 
     const bdayPosition = 7;
     const regDatePos = 8 ; 
     const voterStatusPosition = 9; 
     const precinctPosition = 38; 
  const addressPosition = 11;
  const aptPosition = 12; 
  const zipPosition = 15; 
  const primary2012Pos = 84;
  const generalNov14Pos = 91; 
  const primaryMar16Pos = 95; 
  const generalNov16Pos = 98; 
  const generalNov17Pos = 101; 
  const primaryMay18Pos = 102; 

let inputFileName = "MansfieldAllPrecincts.csv";
let outputFileName = "MansfieldAllPrecinctsFewerColumns.csv" ;  

//function to parse the large file and store name details to memory
const parseLargeFile = function(data) {
 
  let rows = data.split("\n");
  let outputData = " sosId , lastName , firstName, middleName, bday, precinct, address, apt, zip, regDate, ov 14, Mar 16, Nov 16, Nov 17,May 18, demVotes , repVotes , otherVotes \n";

  //iterate each line and parse the data
  for (let line = 1; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
      let sosId = splitRow[sosIdPosition];
      let lastName = splitRow[lastNamePosition];
      let firstName = splitRow[firstNamePosition];
      let middleName = splitRow[middleNamePosition];
      let bday = splitRow[bdayPosition] ; 
      let voterStatus = splitRow[voterStatusPosition] ; 
      let precinct = splitRow[precinctPosition] ; 
      let registrationDate = splitRow[regDatePos] ; 
      let address = splitRow[addressPosition] ; 
      let apt = splitRow[aptPosition] ; 
      let zip = splitRow[zipPosition] ; 
      let door = address + " " + apt   ; 
      let demVotes = 0 ;
      let repVotes = 0 ; 
      let otherVotes = 0 ; 

      let dob_split = bday.replace('"','').replace('"','').split("-");
      var dob = new Date(dob_split[0],dob_split[1],dob_split[2]);


      let outputline = sosId + "," + lastName  + "," + firstName + "," + middleName + "," + bday   ; 

      
      for (indexJ=primary2012Pos; indexJ<=primaryMay18Pos; indexJ++ ) { 
//        console.log(" vote is " + splitRow[indexJ] ) ;     
	if ( splitRow[indexJ].includes("D" )) demVotes++; 
	if ( splitRow[indexJ].includes( "R") ) repVotes++; 
	if ( splitRow[indexJ].includes("X" ) ) otherVotes++; 
      }
       outputline = outputline + "," + precinct + "," + address + "," + apt + "," + zip + 
       "," + registrationDate + 
       "," + splitRow[generalNov14Pos] + "," + splitRow[primaryMar16Pos] + 
       "," + splitRow[generalNov16Pos] + "," + splitRow[generalNov17Pos] +  
       "," + splitRow[primaryMay18Pos] + "," + demVotes + "," + repVotes + "," + otherVotes ;

      if ( !under22only || calculateUnder22( dob ) ) {
          outputData = outputData + outputline + "\n"; 
      }
      
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
  if (index === 4) {
    if ( debugOutput ) { console.log('under22only: ' + val); }
    under22only = val;
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
