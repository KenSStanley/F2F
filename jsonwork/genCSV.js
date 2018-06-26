//CSV to JSON converter
const fs = require('fs');


var allRecs = [];

loadFile("Mansfield6A  - Turf 1 MAN 6A.json");
loadFile("Mansfield6A  - Turf 2 MAN 6A.json");
loadFile("Mansfield6A  - Turf 3 MAN 6A.json");
loadFile("Mansfield6A  - Turf 4 MAN 6A.json");
loadFile("Mansfield6A  - Turf 5 MAN 6A.json");
loadFile("Mansfield6A  - Turf 6 MAN 6A.json");
loadFile("Mansfield6A  - Turf 7 MAN 6A.json");
loadFile("Mansfield6A  - Turf 8 MAN 6A.json");

generateCSV("Turf1");
generateCSV("Turf2");
generateCSV("Turf3");
generateCSV("Turf4");
generateCSV("Turf5");
generateCSV("Turf6");
generateCSV("Turf7");
generateCSV("Turf8");


function loadFile(fileName) {
    var csvContents = fs.readFileSync(fileName, 'utf8');
    var contents = JSON.parse(csvContents);

    contents.forEach( function(item) {
        allRecs.push(item);
    });
}

function generateCSV(turfName) {
    var output = "SOS_VOTERID,Name_Age_Address,mappableAddress,full_order\n";
    var lastAddress  ="";
    allRecs.forEach( function(item) {
        if (item.turf!=turfName) {
            return;
        }
        if (lastAddress!=item.mappableAddress) {
            output += ",,,";
            output += Math.floor(item.full_order);
            output += "\n";
            lastAddress = item.mappableAddress;
        }
        output += item.SOS_VOTERID;
        output += ","
        output += item.name + " (" + item.age + ") " + item.shortAddress;
        output += ","
        output += item.mappableAddress;
        output += ","
        output += item.full_order;
        output += "\n"
    });
    fs.writeFileSync("out"+turfName+".csv", output);
    console.log("completed CSV: "+"out"+turfName+".csv");
    generateHTML(turfName);
}

function generateHTML(turfName) {
    var output = "<!DOCTYPE html>\n<html>\n<body><link rel=\"stylesheet\" type=\"text/css\" href=\"realstyle.css\">\n";
    output += "<table>\n<tr><th>SOS_VOTERID</th><th>Name_Age_Address</th><th>mappableAddress</th><th>full_order</th></tr>\n";
    var lastAddress  ="";
    allRecs.forEach( function(item) {
        if (item.turf!=turfName) {
            return;
        }
        if (lastAddress!=item.mappableAddress) {
            output += "<tr><td></td><td></td><td></td><td>";
            output += Math.floor(item.full_order);
            output += "</td></tr>\n";
            lastAddress = item.mappableAddress;
        }
        output += "<tr><td>"
        output += item.SOS_VOTERID;
        output += "</td><td>";
        output += item.name + " (" + item.age + ") " + item.shortAddress;
        output += "</td><td>";
        output += item.mappableAddress;
        output += "</td><td>";
        output += item.full_order;
        output += "</td></tr>\n";
    });
    output += "</table></body></html>\n"
    fs.writeFileSync("out"+turfName+".html", output);
    console.log("completed HTML: "+"out"+turfName+".csv");
}

console.log("ALL DONE");
