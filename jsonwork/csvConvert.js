//CSV to JSON converter
const fs = require('fs');
const utils = require("./utils.js");

convertFile("Mansfield6A  - Turf 1 MAN 6A", "Turf1", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 2 MAN 6A", "Turf2", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 3 MAN 6A", "Turf3", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 4 MAN 6A", "Turf4", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 5 MAN 6A", "Turf5", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 6 MAN 6A", "Turf6", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 7 MAN 6A", "Turf7", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 8 MAN 6A", "Turf8", "Man6a", convertInternal);
convertFile("Mansfield6A  - Turf 9 Apts", "Turf9", "Man6a", convertInternal);

//convertFile("Mansfield voters in 9 Dem Precincts - In 24June18Not in23DEC17","unknown", "Man6a", convertOrthodox);


function convertFile(fileName, thisTurf, precinct, recordConverter) {
    var csvContents = fs.readFileSync(fileName+".csv", 'utf8');

    var csvRows = csvContents.split("\n");

    var nameRow = csvRows[0];
    var names = utils.csvParseLine(nameRow);
    var total = [];

    for (var i=1; i<csvRows.length; i++) {
        console.log("###################################."+i)
        var vals = utils.csvParseLine(csvRows[i]);
        if (!vals[0]) {
            continue;
        }
        var approx = {};
        approx.turf=thisTurf;
        approx.precinct = precinct;
        var limit = vals.length;
        if (limit>names.length) {
            limit = names.length;
        }
        for (var j=0; j<limit; j++) {
            var oneVal = vals[j];
            if (!oneVal) {
                //console.log("Skipping "+j+" - "+names[j]);
                continue;
            }
            var oneName = names[j];
            if (!oneName || oneName.trim().length == 0) {
                //console.log("Unnamed Val "+j+" - "+oneVal);
                continue;
            }
            if (oneName.startsWith("x")) {
                console.log("  "+oneName+":  "+oneVal);
                continue;
            }
            console.log("- "+oneName+":  "+oneVal);
            approx[oneName] = oneVal.trim();
        }
        recordConverter(total,approx,thisTurf, precinct);
    }
    fs.writeFileSync(fileName+".json", JSON.stringify(total,null, 2));
}



function convertInternal(total, approx, thisTurf, precinct ) {
    if (!approx.SOS_VOTERID || !approx.SOS_VOTERID.startsWith("OH")) {
        return;
    }
    var official = {};
    official.sosId = approx.SOS_VOTERID;
    var oneVal = approx.Name_Age_Address;
    var parenOpen = oneVal.indexOf("(");
    var parenClose = oneVal.indexOf(")");
    official.name = oneVal.substring(0,parenOpen).trim();
    official.age = oneVal.substring(parenOpen+1, parenClose).trim();
    official.shortAddress = oneVal.substring(parenClose+1).trim();
    
    if (approx.precinct) {
        official.precinct = approx.precinct;
    }
    official.mappableAddress = approx.mappableAddress;

    official.longitude = Number(approx.longitude);
    official.latitude  = Number(approx.latitude);
    official.turf = thisTurf;
    official.precinct = precinct;
    official.order = Number(approx.order);
    official.full_order = Number(approx.full_order);
    total.push(official);
}


function convertOrthodox(total, approx, thisTurf, precinct ) {
    var official = {};
    official.sosId = approx.sosId
    official.name = utils.capSentence(approx.firstName + " " + approx.lastName);
    if (approx.bday) {
        var dashPos = approx.bday.indexOf("-");
        var year = Number(approx.bday.substring(0,dashPos));
        official.age = 2018-year;
    }
    else {
        official.age = -1;
    }
    if (approx.door) {
        official.shortAddress = fixShortAddress(approx.door);
    }
    else {
        official.mappableAddress = "MISSING DOOR FROM DB";
    }
    if (approx.precinct) {
        official.precinct = convertPrecinct(approx.precinct);
    }
    if (approx.address) {
        official.mappableAddress = makeMappableAddress(approx.address);
    }
    else {
        official.mappableAddress = "MISSING ADDRESS FROM DB";
    }
    official.longitude = Number(approx.Longitude);
    official.latitude  = Number(approx.Latitude);
    total.push(official);
}


function convertPrecinct(value) {
    //convert "MAN 3 - A" to "Man3a"
    var stripped = value.replace(/ /g, "").replace("-", "");
    return utils.capWord(stripped);
}

function fixShortAddress(value) {
    //first get rid of unnecessary quotes,
    //then trim to eliminate unneeded spaces off end.
    return utils.capSentence(value.replace(/\"/g, "").trim());
}
function makeMappableAddress(address) {
    //first get rid of 1/2 if it is there
    var idx = address.indexOf("1/2");
    if (idx>0) {
        address = address.substring(0,idx)+address.substring(idx+4);
    }
    return utils.capSentence(address).trim()+" Manfield OH";
}


function stripZipCode(address) {
    //first get rid of unnecessary quotes,
    //then trim to eliminate unneeded spaces off end.
    return value.substring(0, value.length-5).trim();
}




console.log("ALL DONE");
