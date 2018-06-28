//CSV to JSON converter
const fs = require('fs');


var allDims = {};

renumber("Mansfield6A  - Turf 1 MAN 6A.json");
renumber("Mansfield6A  - Turf 2 MAN 6A.json");
renumber("Mansfield6A  - Turf 3 MAN 6A.json");
renumber("Mansfield6A  - Turf 4 MAN 6A.json");
renumber("Mansfield6A  - Turf 5 MAN 6A.json");
renumber("Mansfield6A  - Turf 6 MAN 6A.json");
renumber("Mansfield6A  - Turf 7 MAN 6A.json");
renumber("Mansfield6A  - Turf 8 MAN 6A.json");

fs.writeFileSync("turfDims.json", JSON.stringify(allDims, null, 2));


function renumber(fileName) {
    var csvContents = fs.readFileSync(fileName, 'utf8');
    var contents = JSON.parse(csvContents);
    var lastAddress = "";
    var position = 0;
    var subposition = 1;
    

    contents.forEach( function(item) {
        if (lastAddress!=item.mappableAddress) {
            position++;
            subposition = 1;
            lastAddress = item.mappableAddress;
        }
        item.full_order = position + ".00" + subposition;
        delete item.full_order2;
        subposition++;
    });
    
    fs.writeFileSync(fileName, JSON.stringify(contents,null, 2));
}

console.log("ALL DONE");
