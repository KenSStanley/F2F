#!/usr/bin/env node


// GET THE ARGUMENTS FOR THE PROGRAM - INPUT AND OUTPUT FILES!
if(process.argv.length != 4) {
  console.error("Expected input file and output file!");
  console.error(process.argv[1] + " input.html output.csv");
  process.exit(1)
}
const inputFile = process.argv[2];
const outputFile = process.argv[3];

console.log("Reading data from "+ inputFile + " and writing to " + outputFile);

const fs = require('fs');

// This is a tool for parsing HTML text
const cheerio = require('cheerio');

// This loads the HTML from your file into the Cheerio tool
const $ = cheerio.load(fs.readFileSync(inputFile));

// This is the list of names that will become the CSV
let csvData = [];

$('h2').each((i, e) => {
  let category = $(e).text();

  // skip some sections
  /*
  if(!category.includes('Friend') && !category.includes('Follower')) {
    console.log('skipping category ' + category);
    return;
  }
  */

  console.log('processing category '+category);
  // for the categories we do not skip, chew through all the list items
  $(e).next('ul').find('li').each((i, e) => {
    let name = $(e).text();
    let groups = name.match(/^([^ ]+) ?(.*) ([^ ]+) [(]/);
    if(groups == null) {
       console.log("skipping badly formatted entity: '"+name+"'");
       return;
    } 
    
    csvData.push([category, groups[1], groups[2], groups[3]]); 
  });
});


console.log('preparing to write CSV data');
const csvWriter = require('csv-writer').createArrayCsvWriter({path: outputFile})
csvWriter.writeRecords(csvData);
console.log('wrote CSV data');

