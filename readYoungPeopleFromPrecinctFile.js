/**
 * Created by Ken Stanley on 3/20/18 - 
 *
 * TODO:
 *
 * Inputs:
 *   County download file
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

const birthdatePos = 7 ; 
const general2017Pos = 101; 

let inputFileName = "Precinct2016Gibbs"
let outputFileName = "outputFile" ;  

let Apr13_18 = new Date(2018,4,13); 

const calculateUnder23 = ( bdate ) => {
    let dayDiff = ( Apr13_18 - bdate.getTime() ) / (24*60*60*1000) ; // getTime() returns milliseconds since Jan 1, 1970

//    console.log( " bdate.getTime() = " , bdate.getTime(), " dayDiff = " , dayDiff ) ; 

    return ( (23 - dayDiff/365.25) > 0 ) ;   
}

//function to parse the large file and store name details to memory
const parseLargeFile = function(data) {
 
  let rows = data.split("\n");
  let outputData = rows[0] + "\n"; 

  //iterate each line and parse the data
  for (let line = 0; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');
 
      let birthdate = splitRow[birthdatePos] ; 
//       console.log( " birthdate = " , birthdate ) ; 
      let dob_split = birthdate.replace('"','').replace('"','').split("-");
//       console.log( " birthdate = " , birthdate ) ; 
      var dob = new Date(dob_split[0],dob_split[1],dob_split[2]);
//       console.log( " dob_split = " , dob_split ) ; 

      let general2017 = splitRow[general2017Pos].replace('"','').replace('"','') ; 
      /*
      console.log( " general2017 = " , general2017 ) ; 
      console.log( " general2017.valueOf() = " , general2017.replace('"','').replace('"','').valueOf() ) ; 
      console.log(" X.valueOf()= " , "X".valueOf()) ; 
      console.log(" general2017.valueOf()==X.valueOf() = " , general2017.trim().valueOf()=="X".trim().valueOf() ) ; 
      */
      if ( calculateUnder23( dob ) && (general2017.valueOf()=="X".valueOf()) ) { 
          outputData = outputData + rows[line] + "\n"; 
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
