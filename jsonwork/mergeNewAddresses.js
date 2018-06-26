//CSV to JSON converter
const fs = require('fs');


var allRecs = [];
var output = "";

loadFile("Mansfield6A  - Turf 1 MAN 6A.json");
loadFile("Mansfield6A  - Turf 2 MAN 6A.json");
loadFile("Mansfield6A  - Turf 3 MAN 6A.json");
loadFile("Mansfield6A  - Turf 4 MAN 6A.json");
loadFile("Mansfield6A  - Turf 5 MAN 6A.json");
loadFile("Mansfield6A  - Turf 6 MAN 6A.json");
loadFile("Mansfield6A  - Turf 7 MAN 6A.json");
loadFile("Mansfield6A  - Turf 8 MAN 6A.json");

var addressFile = fs.readFileSync("Mansfield voters in 9 Dem Precincts - In 24June18Not in23DEC17.json", 'utf8');
var newAddresses = JSON.parse(addressFile);

console.log("New Addresses: ", newAddresses);

newAddresses.forEach( function(item) {
    processRecord(item);
});


function processRecord(item) {
    var precinct = item.precinct;
    if (precinct!="Man6a") {
        console.log("ignoring precinct "+precinct+" "+item.name);
        return;
    }
    var foundRec = null;
    var foundDistance = 999999;
    allRecs.forEach( function(other) {
        var dist = distance(item,other);
        //console.log("comparing "+item.longitude+" and "+other.longitude);
        if (dist<foundDistance) {
            foundDistance = dist;
            foundRec = other;
        }
    });
    output += "New record: "+item.SOS_VOTERID+", "+item.name+" ("+item.age+") "+item.mappableAddress;
    output += "\n    Should be in "+foundRec.turf;
    output += "\n    Nearest house "+foundRec.SOS_VOTERID+",  "+foundRec.name+" ("+foundRec.age+") "+foundRec.mappableAddress;
    output += "\n    Position near "+foundRec.order;
    output += "\n    distance is "+foundDistance;
    output += "\n---------------\n";
    
}

fs.writeFileSync("mergeResults.txt", output);

function distance(o1, o2) {
    var latDist = o1.latitude - o2.latitude;
    var lonDist = o1.longitude - o2.longitude;
    distSQ = (latDist*latDist) + (lonDist*lonDist);
    var dist = Math.sqrt(distSQ);
    //console.log("   - ("+o1.latitude+"/"+o1.longitude+") and ("+o2.latitude+"/"+o2.longitude+") == "+dist);
    return dist;
}

function loadFile(fileName) {
    var csvContents = fs.readFileSync(fileName, 'utf8');
    var contents = JSON.parse(csvContents);

    contents.forEach( function(item) {
        allRecs.push(item);
    });
}



console.log("ALL DONE");
