//CSV to JSON converter
const fs = require('fs');
const utils = require("./utils.js");

var allRecs = [];

utils.loadFile(allRecs,"Mansfield6A  - Turf 5 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 6 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 7 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 8 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 1 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 2 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 3 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 4 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 9 Apts.json");

utils.htmlTableDump(allRecs,"tempDumpJustLoaded.html",
       ["turf", "full_order","sosId","name","age","mappableAddress"],
       "This is just to see if all sorted in the right order");


utils.sortRecsAscending(allRecs);

utils.htmlTableDump(allRecs,"tempDump.html",
       ["turf", "full_order","sosId","name","age","mappableAddress"],
       "This is just to see if all sorted in the right order");

var addressFile = fs.readFileSync("Mansfield voters in 9 Dem Precincts - In 24June18Not in23DEC17.json", 'utf8');
var newAddresses = JSON.parse(addressFile);


var resultSet = [];
newAddresses.forEach( function(newItem) {
    processRecord(resultSet, newItem);
});

resultSet.sort( function(a,b) {
    return a.index-b.index;
});

utils.htmlTableDump(resultSet,"resultDump.html",
       ["closeTurf", "closeOrder","closeAddr", "newAddr","sameAddress","newName", "closeName", "distance"],
       "This is the found positions in the set");

allRecs.forEach( function(oldItem) {
    oldItem.isNew = "";
});
       
var newList = [];
var mergeIndex = 0;
resultSet.forEach( function(newItem) {
    while (mergeIndex<=newItem.index) {
        newList.push(allRecs[mergeIndex++]);
    }
    var thisRec = allRecs[mergeIndex-1];
    var newRec = {};
    newRec.precinct = thisRec.precinct;
    newRec.turf = thisRec.turf;
    newRec.sosId = newItem.newRec.sosId;
    newRec.name = newItem.newRec.name;
    newRec.age = newItem.newRec.age;
    newRec.shortAddress = newItem.newRec.shortAddress;
    newRec.mappableAddress = newItem.newRec.mappableAddress;
    
    if (newItem.sameAddress) {
        newRec.isNew = "SAME";
        newRec.order = thisRec.order;
        newRec.full_order = thisRec.full_order + (1/1000);
    }
    else {
        newRec.isNew = "NEW";
        newRec.order = thisRec.order + 0.5;
        newRec.full_order = thisRec.order + (1/1000);
    }
    newList.push(newRec);
});

//pick up all the rest
while (mergeIndex<allRecs.length) {
    newList.push(allRecs[mergeIndex++]);
}

utils.renumber(newList);
utils.htmlTableDump(newList,"combinedDump.html",
       ["isNew", "turf", "full_order","sosId","name","age","mappableAddress", "shortAddress"],
       "This is final merged sets");
       
selectProcessTurf("Turf1",newList);
selectProcessTurf("Turf2",newList);
selectProcessTurf("Turf3",newList);
selectProcessTurf("Turf4",newList);
selectProcessTurf("Turf5",newList);
selectProcessTurf("Turf6",newList);
selectProcessTurf("Turf7",newList);
selectProcessTurf("Turf8",newList);
selectProcessTurf("Turf9",newList);

       
function selectProcessTurf(turf, fullList) {
    var subList = [];
    fullList.forEach( function(item) {
        if (item.turf == turf) {
            subList.push(item);
        }
    });
    utils.renumber(subList);
    generateCSV(subList, turf);
}
       

function processRecord(resultSet, item) {
    var precinct = item.precinct;
    if (precinct!="Man6a") {
        return;
    }
    var newSAddress = item.shortAddress.toLowerCase();
    var foundIndex = -1;
    var foundDistance = 999999;
    for (var i=0; i<allRecs.length; i++) {
        other = allRecs[i];
        var dist = utils.distance(item,other);
        if (dist<foundDistance) {
            foundDistance = dist;
            foundIndex = i;
        }
    }
    
    var result = {};
    if (newSAddress == allRecs[foundIndex].shortAddress.toLowerCase()) {
        result.sameAddress = true;
        var spanStart = foundIndex;
        var spanEnd = foundIndex;
        while (newSAddress == allRecs[spanStart-1].shortAddress.toLowerCase()) {
            spanStart = spanStart-1;
        }
        while (newSAddress == allRecs[spanEnd+1].shortAddress.toLowerCase()) {
            spanEnd = spanEnd+1;
        }
        foundIndex = spanEnd;
    }
    else {
        result.sameAddress = false;
        var distEarlier = utils.distance(item,allRecs[foundIndex-1]);
        var distLater = utils.distance(item,allRecs[foundIndex+1]);
        if (distEarlier<distLater) {
            foundIndex = foundIndex-1;
        }
        else {
            foundIndex = foundIndex;
        }
    }
    var foundRec = allRecs[foundIndex];
    result.newRec = item;
    result.newAddr = item.mappableAddress;
    result.newName = item.name;
    result.index = foundIndex;
    result.distance = foundDistance;
    result.closeRec = foundRec;
    result.closeTurf = foundRec.turf;
    result.closeOrder = foundRec.full_order;
    result.closeAddr = foundRec.mappableAddress;
    result.closeName = foundRec.name;
    result.distance = utils.distance(item,foundRec);
    resultSet.push(result);
}

function generateCSV(allRecs, turfName) {
    var output = "SOS_VOTERID,Name_Age_Address,mappableAddress,full_order\n";
    var lastAddress  ="";
    allRecs.forEach( function(item) {
        if (item.turf!=turfName) {
            return;
        }
        if (lastAddress!=item.mappableAddress.toLowerCase()) {
            output += ",,,";
            output += Math.floor(item.full_order);
            output += "\n";
            lastAddress = item.mappableAddress.toLowerCase();
        }
        output += item.sosId;
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
    generateHTML(allRecs, turfName);
}

function generateHTML(allRecs, turfName) {
    var output = "<!DOCTYPE html>\n<html>\n<body><link rel=\"stylesheet\" type=\"text/css\" href=\"realstyle.css\">\n";
    output += "<table>\n<tr><th>SOS_VOTERID</th><th>Name_Age_Address</th><th>mappableAddress</th><th>full_order</th></tr>\n";
    var lastAddress  ="";
    allRecs.forEach( function(item) {
        if (item.turf!=turfName) {
            return;
        }
        if (lastAddress!=item.mappableAddress.toLowerCase()) {
            output += "<tr><td></td><td></td><td></td><td>";
            output += Math.floor(item.full_order);
            output += "</td></tr>\n";
            lastAddress = item.mappableAddress.toLowerCase();
        }
        output += "<tr><td>"
        output += item.sosId;
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
