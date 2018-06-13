/**
 * Created by Ken Stanley on 5/27/18 - 
 *
 * TODO:
 *
 * Inputs:
 *   County download file aka RICHLAND.txt
 * Outputs:
 *   Addresses for all records with a Mansfield address
 *   i.e. address, Mansfield, OH, Zip 
 */
debugOutput = true; 
const fs = require('fs');

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};

// See RichalndTwoRows to see the ROCHLAND.txt header
const sosIdPos = 0 ; 
const birthdatePos = 7 ;
const addressPos = 11 ; 
const aptPos = 12; 
const cityPos = 13; 
const zipPos = 15 ;
const primary2017Pos = 102; 
const precinctPos = 38; 
const primary2006Pos = 61;   // PRIMARY-05/02/2006

let inputFileName = "RICHLAND.txt"
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
  let outputData = "SOSID,PRECINCT,ADDRESS,APT,DOOR,CITY,STATE,ZIP,republican pulls,democratic pulls,R-D pulls\n"; 

  //iterate each line and parse the data
  for (let line = 0; line < rows.length; line++) {
    if (rows[line].trim().replace(/\r?\n?/g, '')) {
      let splitRow = rows[line].split(',');

      let sosId = splitRow[sosIdPos] ;  
      let birthdate = splitRow[birthdatePos] ; 

      let precinct = splitRow[precinctPos].replace("\"","").replace("\"","");
      let apt = splitRow[aptPos].replace("\"","").replace("\"","");
      let address = splitRow[addressPos].replace("\"","").replace("\"","").replace("1/2 ",""); 
      if ( splitRow[addressPos].includes("1/2") ) apt = "1/2 " + apt ; 
      let city = splitRow[cityPos].replace("\"","").replace("\"","");
      let zip = splitRow[zipPos].replace("\"","").replace("\"","");


//          console.log( "TOP output data =", outputData ) ;
      /*
      console.log( " general2017 = " , general2017 ) ; 
      console.log( " general2017.valueOf() = " , general2017.replace('"','').replace('"','').valueOf() ) ; 
      console.log(" X.valueOf()= " , "X".valueOf()) ; 
      console.log(" general2017.valueOf()==X.valueOf() = " , general2017.trim().valueOf()=="X".trim().valueOf() ) ; 
      */
      //  if ( calculateUnder23( dob ) && (general2017.valueOf()=="X".valueOf()) ) { 
      if ( city == "MANSFIELD" ) {
          RepublicanPulls = 0 ; 
          DemocraticPulls = 0 ; 
          for (let column = primary2006Pos; column <= primary2017Pos; column++) {
            voteMark = splitRow[column];
            if ( voteMark.includes("R") ) RepublicanPulls++ ; 
            if ( voteMark.includes("D") ) DemocraticPulls++ ; 
          }
          netRep =  RepublicanPulls-DemocraticPulls ; 
          door =  splitRow[addressPos].replace("\"","").replace("\"","") + " " + splitRow[aptPos].replace("\"","").replace("\"","") ; 
//          outputData = outputData + " " + precinct + "," + sosId + "," + address + "," + apt + "," + door +  ",MANSFIELD,OH," + zip + "," + RepublicanPulls + "," 
//             + DemocraticPulls + "," + RepublicanPulls-DemocraticPulls + "\n"; 
          outputData = outputData + " " + precinct  + "," + sosId + "," + address + "," + apt + "," + door +  ",MANSFIELD,OH," + zip + "," + RepublicanPulls + "," 
               + DemocraticPulls + "," + netRep + "\n"; 
//               + DemocraticPulls + "," + RepublicanPulls-DemocraticPulls + "\n"; 

//          console.log( " door = " , door ) ;
//          console.log( "output data =", outputData ) ;
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

  parseLargeFile(inputFileContents) ; 

};

init();
