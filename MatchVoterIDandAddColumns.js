/**
 * Created by Ken Stanley on 3/4/18 - 
 *
 * TODO:
 *   The code now runs but has several issues, among them: The header is messed up, it only includes one output column, 
 *   the output column says 'false' but I want it to say '0'
 *   add data to each record in parseLargeFile 
 *     knownBy - a simple array, indexed by volunteer # which is blank is this volunteer does not know this voter and 1 if this vol knows this voter
 *     LATER:
 *       how mnay lists is this voter on - i.e. how often have we asked volunteers to look to see if they know this voter? 
 *       volunteersWhoKnowThisVoter 
 *       phoneNumberStatus 
 *        volunteerComments : linked list of name and comments, printed as a single cell in the output 
 *
 * Inputs:
 *   1) Output from MatchFriendsAndScoreVoterList.js 
 *   2) A file containing a list of file names each of which contains a list of IDs of voters that we have asked a given volunteer to look through
 *   3) A flie containing a list of file names each of which contains a list of IDs of voters that a give volunteer has identified as their friend
 *      A) Potential volunteer
 *      B) Good phone number
 *      C) Bad phone number
 *      D) Comment 
 * Outputs:
 *   1) Header row 1
 *        Selected columns from MatchFriendsAndScoreVoterList.js
 *        Selected columns from MatchFriendsAndScoreVoterList.js converted into quntile or decile rankings
 *        Name of each volunteer - maybe six times
 *        Number of volunteers known by 
 *        Comments  
 *        Bad phone number
 *        Good phone number
 *   2) Header row 2 - xxx per volunteer
 *        Viewed by Ken Stanley
 *        Known by Ken Stanley 
 *        Comments by Ken Stanley
 *  
 */
theWholeFile = ""; 
debugOutput = true; 
longerOutput = true; 
longOutput = false; 
var volunteers; 
var thisVolsFriends;
const fs = require('fs');
const sortedMap = require("collections/sorted-map");

const writeOutput = (text) => {
  fs.appendFile(outputFileName, text, (err) => {
    if (err) throw err;
  });
};

var writeOneLine = (entry) => { 

   var outputLine = "";  
   if ( longOutput ) { 
      outputLine =  entry.ID + ',' + entry.fName_large + ',' + entry.mName_large + ',' + entry.lName_large + ',' +
      entry.age + ',' + entry.sex + ',' + entry.party + ',' + entry.address + ',' + entry.phone + ',' + entry.city + ',' +
      entry.state + ',' + entry.zip + ',' + entry.id + ',' + entry.suffix + ',' + entry.dob + ',' +
      entry.precinct + ',' + entry.knownBy + ',' + entry.precinctScore + ',' + entry.voteScore + ',' + entry.under40 + ',' + entry.over70 + ',' + 
      entry.hasPhone + ',' + entry.precinctMatchScore + ',' + entry.ageMatchScore + ',' +
      entry.organizersScore + ',' + 
      entry.maxVoteScore + ',' + 
      entry.fName_small + ',' + entry.mName_small + ',' + entry.lName_small + ',' + entry.firstNameScore + ',' +
      entry.middleNameScore + ',' + entry.lastNameScore + ',' + entry.finalScore ; 
    } else if (longerOutput )  {
      outputLine = entry.ID + ',' + entry.precinct + ',' + entry.phone + ',' + entry.address + ',' + entry.precinct ;
    } else { 
      outputLine = entry.ID + ',' + entry.precinct + ',' + entry.phone + ',' + entry.address ;
    }
    for ( i=0 ; i<volunteers.length-1 ; i++ ) {
      outputLine = outputLine + ',' + ( entry.friends[i] === true ? 1 : 0 ) ; 
    }
    outputLine = outputLine + '\n' ; 
    return outputLine ; 
}   



fileOfVolunteers = "fileOfVolunteers"; 
largeFileName = "MansfieldAllFullHeuristicWithALLPhones.csv";
let largeFile = [];   // This is built by parseLargeFile 
let outputFileName = "outputFile" ;  

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
      let friends = [] ;    // friends[i] = 1 if volName[i] knows this voter. volFriendsFile[i] has a list of all the friends that volName[i] knows
                            // 

      for ( i=0 ; i<volunteers.length-1 ; i++ ) {
         if ( debugOutput && thisVolsFriends[i].has(ID)  ) console.log( " i = " + i + " ID = " + ID + " thisVolsFriends[i].has(ID) =  " 
             + thisVolsFriends[i].has(ID)) ; 
         friends[i] = thisVolsFriends[i].has(ID) ; 
      }
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
        maxVoteScore: maxVoteScore,
        friends: friends
      };
      largeFile.push(nameObject);
      theWholeFile = theWholeFile + writeOneLine( nameObject ) ; 
    }
  }
};

const printDate = function( d ) { 
  return d.getMonth()+1 + '/' + d.getDate() + '/' + d.getFullYear() ;
}

// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 4 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    if ( debugOutput ) { console.log('largeFileName: ' + val); }
    largeFileName = val;
  }
  if (index === 3) {
    if ( debugOutput ) { console.log('fileOfVolunteers: ' + val); }
    fileOfVolunteers = val;
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

  var largeFileContents = fs.readFileSync(largeFileName, 'utf8');

  var volunteerLines = fs.readFileSync( fileOfVolunteers, 'utf8');  

  console.log(volunteerLines) ; 

  let volList = []; 
  let volName = [] ; 
  let volListFile = []; 
  let volFriendsFile = []; 
  volunteers = volunteerLines.split("\n") ;  // an array of volunteers, one line per volunteer (aka one line per line in the volunteer file)

  if ( debugOutput ) console.log("volunteers.length = " +  volunteers.length ) ;

  thisVolsFriends = [] ;    // an array of sorted maps, one map for each volunteer, listing that volunteers identified friends

  // 
  // foreach volunteer, we consider that volunteers friends
  //   we put those friends into a sortedMap named thisVolsFriends[i] 
  // 
  for ( i=0 ; i<volunteers.length-1 ; i++ ) {
    thisVolsFriends[i] = new sortedMap(); 
    
    row =  volunteers[i].split(","); 
    volName[i] = row[0];
    volFriendsFile[i] = row[1];
    volListFile[i] = row[2];   // Someday we may allow multiple vol lists 
    console.log( " i = " + i + "volunteers[" + i + "] = " + volunteers[i] ) ;   
    console.log(" volFriendsFile[" +i+ "]= " + volFriendsFile[i] ) ; 
    console.log(" volListFile[" +i+ "]= " + volListFile[i] ) ; 

    console.log( " volName[ " + i + "] = " + volName[i] ); 

    volList[i] =  fs.readFileSync( volListFile[i], 'utf8');  // This is the list that this vol has looked through 
    theseFriends = volList[i].split("\n"); 
    for (indexJ = 1; indexJ < theseFriends.length-1; indexJ++ ) { 
       row = theseFriends[indexJ].split(",") ; 
       console.log("indexJ = " + indexJ + " this line is " + theseFriends[indexJ] + " row = " + row  + " end of line\n" )  ; 
       // row 1 is optional (the other rows are expected to behave or else )
       if ( (indexJ > 1 ) || (row[0].lastIndexOf("OH") > 0)) { 
         console.assert(row[0].lastIndexOf("OH") === 0," The " + indexJ + "th row of " + volListFile[i] + 
             " does not appear to start with a voter ID , it is: " + theseFriends[indexJ] ) ; 
       }
       if ( (row[0].lastIndexOf("OH") == 0)) {
         thisVolsFriends[i].set(row[0],1); // volName[i] knows this voter 
       }
    } 

} 
  let headers = 'ID, Precinct, Phone, Name (Age) Address';
  
    if ( longOutput ) {
      headers = 'ID,firstName(L),middleName(L),lastName(L),Age,Sex,Party,Address,Phone,City,State,Zip,ID_,Suffix,DOB,' +
        'precinct,knownBy,precinctScore,voteScore,under40,over70,hasPhone ,is bdate ,organizersScore,maxVoteScore,' +
        'firstName(S),middleName(S),lastName(S),firstNameScore,middleNameScore,lastNameScore,finalScore';
    } else if ( longerOutput ) { 
      headers = 'ID, Precinct, Phone, Name (Age) Address,precinct';
    } 

  for ( i=0 ; i<volunteers.length-1 ; i++ ) {
    headers = headers + "," + volName[i] ;
    console.log( "volName[i] = " + volName[i] ) ; 
  }
  headers = headers + "\n" ;
  writeOutput(headers);
  parseLargeFile(largeFileContents) ; 
  writeOutput(theWholeFile) ; 
};

init();
