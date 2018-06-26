//CSV to JSON converter
const fs = require('fs');


convertFile("Mansfield6A  - Turf 8 MAN 6A", "Turf8", "Man6a");
convertFile("Mansfield6A  - Turf 7 MAN 6A", "Turf7", "Man6a");
convertFile("Mansfield6A  - Turf 6 MAN 6A", "Turf6", "Man6a");
convertFile("Mansfield6A  - Turf 5 MAN 6A", "Turf5", "Man6a");
convertFile("Mansfield6A  - Turf 4 MAN 6A", "Turf4", "Man6a");
convertFile("Mansfield6A  - Turf 3 MAN 6A", "Turf3", "Man6a");
convertFile("Mansfield6A  - Turf 2 MAN 6A", "Turf2", "Man6a");
convertFile("Mansfield6A  - Turf 1 MAN 6A", "Turf1", "Man6a");
convertFile("Mansfield6A  -  Mansfield6A Original", "unknown", "Man6a");

//convertFile("Mansfield voters in 9 Dem Precincts - In 24June18Not in23DEC17","unknown", "Man6a");
//convertFile("Mansfield voters in 9 Dem Precincts - Sheet4","unknown", "Man6a");

function convertFile(fileName, thisTurf, precinct) {
    var csvContents = fs.readFileSync(fileName+".csv", 'utf8');

    var csvRows = csvContents.split("\n");

    var nameRow = csvRows[0];
    var names = parseLine(nameRow);
    var total = [];

    for (var i=1; i<csvRows.length; i++) {
        console.log("###################################."+i)
        var vals = parseLine(csvRows[i]);
        if (!vals[0]) {
            continue;
        }
        var o = {};
        o.turf=thisTurf;
        o.precinct = precinct;
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
            if (!tackableField(oneName)) {
                console.log("  "+oneName+":  "+oneVal);
                continue;
            }
            console.log("- "+oneName+":  "+oneVal);
            if (oneName == "Name_Age_Address") {
                var parenOpen = oneVal.indexOf("(");
                var parenClose = oneVal.indexOf(")");
                o.name = oneVal.substring(0,parenOpen).trim();
                o.age = oneVal.substring(parenOpen+1, parenClose).trim();
                o.shortAddress = oneVal.substring(parenClose+1).trim();
            }
            else {
                o[oneName] = oneVal.trim();
            }
        }
        if ((!o.name) && o.firstName && o.lastName) {
            o.name = o.firstName +" "+ o.lastName;
            console.log("Converting name: "+o.name+"-"+o.firstName+"-"+o.lastName);
            delete o.firstName;
            delete o.lastName;
        }
        if ((!o.age) && o.bday) {
            var dashPos = o.bday.indexOf("-");
            var year = Number(o.bday.substring(0,dashPos));
            o.age = 2018-year;
            console.log("Converting bday: "+o.bday+" - "+o.age);
            delete o.bday;
        }
        if (o.precinctf) {
            o.precinct = convertPrecinct(o.precinctf);
            console.log("Converting precinct: ("+o.precinctf+") - "+o.precinct);
            delete o.precinctf;
        }
        total.push(o);
        
    }
    fs.writeFileSync(fileName+".json", JSON.stringify(total,null, 2));
}

function parseLine(val) {
    var i=0;
    var ch = val[i++];
    while (ch == '\r') {
        //ignore linefeed characters wherever they are, particularly just before end of file
        if (i>=val.length) {
            return null;
        }
        ch = val[i++];
    }
    if (i>=val.length) {
        return null;
    }
    var res = [];
    var curVal = "";
    var inquotes = false;
    while (i<val.length) {
        if (inquotes) {
            started=true;
            if (ch == '\"') {
                inquotes = false;
            }
            else {
                curVal += ch;
            }
        }
        else {
            if (ch == '\"') {
                inquotes = true;
                if (started) {
                    // if this is the second quote in a value, add a quote
                    // this is for the double quote in the middle of a value
                    curVal += '\"';
                }
            }
            else if (ch == ',') {
                res.push(curVal);
                curVal = ""
                started = false;
            }
            else if (ch == '\r') {
                //ignore LF characters
            }
            else if (ch == '\n') {
                //end of a line, break out
                break;
            }
            else {
                curVal += ch;
            }
        }
        ch = val[i++];
    }
    
    res.push(curVal);
    return res;
}

function tackableField(fieldName) {
    if (fieldName=="SOS_VOTERID") {
        return true;
    }
    if (fieldName=="longitude") {
        return true;
    }
    if (fieldName=="latitude") {
        return true;
    }
    if (fieldName=="order") {
        return true;
    }
    if (fieldName=="full_order") {
        return true;
    }
    if (fieldName=="mappableAddress") {
        return true;
    }
    if (fieldName=="shortAddress") {
        return true;
    }
    if (fieldName=="age") {
        return true;
    }
    if (fieldName=="name") {
        return true;
    }
    if (fieldName=="firstName") {
        return true;
    }
    if (fieldName=="lastName") {
        return true;
    }
    if (fieldName=="Name_Age_Address") {
        return true;
    }
    if (fieldName=="bday") {
        return true;
    }
    if (fieldName=="precinctf") {
        return true;
    }
    return false;
}

function convertPrecinct(value) {
    //if (value == "MAN 3 - A") {
    //    return "Man3a"
    //}
    //if (value == "MAN 6 - A") {
    //    return "Man6a"
    //}
    var stripped = value.replace(/ /g, "").replace("-", "");
    return stripped.substring(0,1) + stripped.substring(1).toLowerCase();
}

console.log("ALL DONE");
