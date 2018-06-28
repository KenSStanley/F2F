//CSV to JSON converter
const fs = require('fs');
const utils = require("./utils.js");

var allRecs = [];
var output = "";

utils.loadFile(allRecs,"Mansfield6A  - Turf 5 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 6 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 7 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 8 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 1 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 2 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 3 MAN 6A.json");
utils.loadFile(allRecs,"Mansfield6A  - Turf 4 MAN 6A.json");

utils.sortRecsAscending(allRecs);

utils.htmlTableDump(allRecs,"tempDump.html",
       ["turf", "full_order","SOS_VOTERID","name","age","mappableAddress"],
       "This is just to see if all sorted in the right order");

var addressFile = fs.readFileSync("Mansfield voters in 9 Dem Precincts - In 24June18Not in23DEC17.json", 'utf8');
var newAddresses = JSON.parse(addressFile);


var resultSet = [];
newAddresses.forEach( function(newItem) {
    //strip the zip code off
    var mapAddr = newItem.mappableAddress;
    newItem.mappableAddress = mapAddr.substring(0,mapAddr.length-6);
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
    newRec.SOS_VOTERID = newItem.newRec.SOS_VOTERID;
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
       ["isNew", "turf", "full_order","SOS_VOTERID","name","age","mappableAddress", "shortAddress"],
       "This is final merged sets");


function processRecord(resultSet, item) {
    var precinct = item.precinct;
    if (precinct!="Man6a") {
        return;
    }
    var newMapAddress = item.mappableAddress.toLowerCase();
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
    if (newMapAddress.startsWith(allRecs[foundIndex].mappableAddress.toLowerCase())) {
        result.sameAddress = true;
        var spanStart = foundIndex;
        var spanEnd = foundIndex;
        while (newMapAddress.startsWith(allRecs[spanStart-1].mappableAddress.toLowerCase())) {
            spanStart = spanStart-1;
        }
        while (newMapAddress.startsWith(allRecs[spanEnd+1].mappableAddress.toLowerCase())) {
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

fs.writeFileSync("mergeResults.txt", output);



console.log("ALL DONE");
