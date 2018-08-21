/**
 * Created by priyathg on 2/11/18.
 * Updated by Priyathg in July 2018
 *
 * Inputs:
 *   input1file is a cut and paste from a VoteBuilder pdf file
 *   input2file is a subset of the voter database with the following fields:
 *     sosId
 *     lastname
 *     firstName
 *     middle name
 *     bday
 *     precinct - unused?
 *     address
 *     apt - unused?
 *     zip code  unused?
 *     more unused fields
 * Outputs:
 *   outputFile contains most of the information from both of these two files 
 */
const fs = require('fs');

let input1FileName = 'input1';
let input2FileName = 'input2';
let outputFileName = 'output';

let input1Info = [];
let input2Info = [];

// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 2 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    console.log('input file 1: ' + val);
    input1FileName = val;
  }
  if (index === 3) {
    console.log('input file 2: ' + val);
    input2FileName = val;
  }
  if (index === 4) {
    console.log('output file: ' + val);
    outputFileName = val;
  }
});

//read raw data from input1 and input2 files
const init = function() {
  console.log('Reading data from files..');
  input1Info = [];
  input2Info = [];
  readInput(input1FileName, singleLineUserParser).then((str)=>{
    parseInputFile1(str);
    return readInput(input2FileName, parseInputFile2).then(()=>{
      let finalOutput = generateOutput();
      addHeaders(finalOutput);
      writeOutput(finalOutput.map((entry) => {
        return entry.trim() === '' ? entry : entry + '\n';
      }).join(""));
    })
  });
};

const addHeaders = function(arr){
  let headers = 'SosID, First Name, Middle Name, Last Name, Age, Sex ,Party, Phone, Street Address, City, Zip';
  arr.splice(0, 0, headers);
};

//function to read input from specified path
const readInput = function (path, parsingFunction) {
  return new Promise(function(resolve, reject){
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) {
        console.log('Error reading content at path: ' + path);
        reject(err);
      } else {
        let returnedData = parsingFunction(data);
        resolve(returnedData);
      }
    });
  })
};

const parseInputFile1 = function(dataString) {
  let newLineArray = dataString.split('\n');
  newLineArray.forEach((el)=>{
    let userLine =  el.trim().split('|');
    //valid user information
    if (userLine && userLine.length >= 3) {
      let nameInfo = userLine[0];
      let phoneInfo;
      let personalInfo;
      if (userLine.length === 3){
        personalInfo = userLine[1];
      } else if (userLine.length === 4){
        phoneInfo = userLine[1];
        personalInfo = userLine[2];
      }

      let obj1 = getNameInfo(nameInfo);
      let obj2 = getPhoneInfo(phoneInfo);
      let obj3 = getPersonalInfo(personalInfo);

      let mergedObject = Object.assign({}, obj1, obj2, obj3);
      input1Info.push(mergedObject);
    }
  });
};

const parseInputFile2 = function(data) {
  //console.log(JSON.stringify(data));
  let splitByLine = data.split('\n');
  splitByLine.forEach(function (el) {
    let entry = el.split(',');
    if (! (entry[0]==='sosId')){
      //extract info
      let userObj = {};
      let sosId = entry[0];
      let firstname = entry[2];
      let lastname = entry[1];
      let middlename = entry[3];
      let bday = entry[4];
      let address = entry[6];

      //assign extracted values to obj
      userObj['sosId'] = sosId ? sosId.trim().replace(/"/g,"") : '';
      userObj['fname'] = firstname ? firstname.trim().replace(/"/g,"") : '';
      userObj['lname'] = lastname ? lastname.trim().replace(/"/g,"") : '';
      userObj['age'] = bday ? calculateAge(bday.trim()) : '';
      userObj['address'] = address ? address.trim().replace(/"/g,"") : '';
      userObj['middlename'] = middlename ? middlename.trim().replace(/"/g,"") : '';
      input2Info.push(userObj);
    }
  });
};

const generateOutput = function() {
  return input1Info.map(function(userInfo1){

    //info from file1
    let fname1 = userInfo1.fname;
    let lname1 = userInfo1.lname;
    let age1 = userInfo1.age;
    let sex1 = userInfo1.sex;
    let party1 = userInfo1.party;
    let city1 = userInfo1.city;
    let zip1 = userInfo1.zip;
    let phone1 = userInfo1.phone;
    let match = '';

    for (let userInfo2 of input2Info) {
      //info from file2
      let fname2 = userInfo2.fname;
      let lname2 = userInfo2.lname;
      let age2 = userInfo2.age;
      let sosId2 = userInfo2.sosId;
      let address2 = userInfo2.address;
      let mname2 = userInfo2.middlename;

      if ((fname1.toLowerCase() === fname2.toLowerCase()) && (lname1.toLowerCase() === lname2.toLowerCase()) && isBirthdayWithinOneYear(age1, age2)) {
        match = sosId2 + ',' + fname1 + ',' + mname2 + ',' + lname1 + ','
          + age2 + ',' + sex1 + ',' + party1 + ',' + phone1 + ',' + address2 + ',' + city1 + ',' + zip1;
        break;
      }
    }
    return match;
  });
};

const getNameInfo = function(str) {
  let userObject = {};
  let splitLine = str.split(' ');
  let length = splitLine.length;
  let fname = splitLine[0];
  let lname = splitLine[1];
  let zip = splitLine[length-1];
  let city = splitLine[length-2];
  userObject['fname'] = fname ? fname.trim().replace(/"/g,"") : '';
  userObject['lname'] = lname ? lname.trim().replace(/"/g,"") : '';
  userObject['zip'] = zip ? zip.trim().replace(/"/g,"") : '';
  userObject['city'] = city ? city.trim().replace(/"/g,"") : '';

  return userObject;
};

const getPhoneInfo = function(str) {
  let userObject = {};
  userObject['phone'] = str && str.trim() ? str.trim().replace(/"/g,"") : '';
  return userObject;
};

const getPersonalInfo = function(str) {
  let userObject = {};

  if (str && str.trim()) {
    let splitLine = str.split(' ');
    let sex = splitLine[1];
    let age = splitLine[3];
    let party = splitLine[5];

    userObject['sex'] = sex ? sex.trim().replace(/"/g,"") : '';
    userObject['age'] = age ? age.trim().replace(/"/g,"") : '';
    userObject['party'] = party ? party.trim().replace(/"/g,"") : '';
  }
  return userObject;
};

//initial parsing to get single user information to a single line
const singleLineUserParser = function(data) {
  let rowData = data.split('\n');
  let str = '';
  rowData.forEach((el)=>{
    let parsedEl = extractASCII(el);
    let isPhone = isPhoneNumber(parsedEl);
    let isPersonal = isPersonalInfo(parsedEl);
    if (!(isPhone || isPersonal)){
      str += '\n' + parsedEl + '|';
    } else{
      str += parsedEl + '|'
    }
  });
  return str;
};

const writeOutput = (text) => {
  fs.writeFile(outputFileName + '.csv', text, (err) => {
    if (err) throw err;
  });
};

init();


/*****************UTILITY FUNCTIONS************************/

//this removes any garbage text from a given string
const extractASCII = function(str) {
  return str.replace(/[^\x00-\xFF]/g, "");
};

//check if a string is a phone number
const isPhoneNumber = function(str){
  return /^(\([0-9]{3}\)\s*|[0-9]{3}\-)[0-9]{3}-[0-9]{4}$/.test(str) ||
    /^\d+$/.test(str.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'').replace(/\s/g, "").trim());
};

//chek if a string contains personal info
const isPersonalInfo = function(str) {
  let splitArr = str.split(' ');
  let sex = splitArr[0];
  let age = splitArr[2];
  return (sex && age && sex.toLowerCase() === 'sex:' && age.toLowerCase() === 'age:');
};

const isBirthdayWithinOneYear = function(age1, age2){
  return Math.abs(age1 - age2) <= 1;
};

const calculateAge = function(dob) {
  let birthDate = new Date(dob);
  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
