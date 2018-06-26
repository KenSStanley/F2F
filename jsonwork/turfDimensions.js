//CSV to JSON converter
const fs = require('fs');


var allDims = {};

getDims("Mansfield6A  - Turf 1 MAN 6A.json");
getDims("Mansfield6A  - Turf 2 MAN 6A.json");
getDims("Mansfield6A  - Turf 3 MAN 6A.json");
getDims("Mansfield6A  - Turf 4 MAN 6A.json");
getDims("Mansfield6A  - Turf 5 MAN 6A.json");
getDims("Mansfield6A  - Turf 6 MAN 6A.json");
getDims("Mansfield6A  - Turf 7 MAN 6A.json");
getDims("Mansfield6A  - Turf 8 MAN 6A.json");

fs.writeFileSync("turfDims.json", JSON.stringify(allDims, null, 2));


function getDims(fileName) {
    var csvContents = fs.readFileSync(fileName, 'utf8');
    var contents = JSON.parse(csvContents);

    contents.forEach( function(item) {
        var turf = item.turf;
        var lon = parseFloat(item.longitude);
        var lat = parseFloat(item.latitude);
        console.log("--"+turf+" | "+lon+" | "+lat);
        if (lon<39 || lon>41) {
            console.log("exit lon "+lon);
            return;
        }
        if (lat<-83 || lat>-82) {
            console.log("exit lat "+lat);
            return;
        }
        
        if (!allDims[turf]) {
            allDims[turf] = {maxLon:item.longitude, minLon:item.longitude, maxLat:item.latitude, minLat:item.latitude};
        }
        else {
            var dims = allDims[turf];
            if (dims.minLon>lon) {
                dims.minLon = lon;
            }
            if (dims.maxLon<lon) {
                dims.maxLon = lon;
            }
            if (dims.minLat>lat) {
                dims.minLat = lat;
            }
            if (dims.maxLat<lat) {
                dims.maxLat = lat;
            }
        }
    });
}

console.log("ALL DONE");
