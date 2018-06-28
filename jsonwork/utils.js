const fs = require('fs');

module.exports = {
    
    sortRecsAscending: function(recList) {
        recList.sort( function(a,b) {
            var del = a.precinct.localeCompare(b.precinct);
            if (del!=0) {
                return del;
            }
            del = a.turf.localeCompare(b.turf);
            if (del!=0) {
                return del;
            }
            return Number(a.full_order)-Number(b.full_order);
        });
    },
    
    distance: function(o1, o2) {
        var latDist = o1.latitude - o2.latitude;
        var lonDist = o1.longitude - o2.longitude;
        distSQ = (latDist*latDist) + (lonDist*lonDist);
        var dist = Math.sqrt(distSQ);
        return dist;
    },
    
    
    loadFile: function(collection, fileName) {
        var csvContents = fs.readFileSync(fileName, 'utf8');
        var contents = JSON.parse(csvContents);
        this.renumber(contents);
        contents.forEach( function(item) {
            collection.push(item);
        });
    },
    
    htmlTableDump: function(collection, fileName, fields, title) {
        var output = "<!DOCTYPE html>\n<html>\n<body><link rel=\"stylesheet\" "
                   + "type=\"text/css\" href=\"realstyle.css\">\n<h3>"+title+"</h3><table>";
        output += "\n<tr>";
        fields.forEach( function(fieldName) {
            output += "\n  <th>" + fieldName + "</th>";
        });
        output += "\n</tr>";
        collection.forEach(function(item) {
            output += "\n<tr>";
            fields.forEach( function(fieldName) {
                output += "\n  <td>" + item[fieldName] + "</td>";
            });
            output += "\n</tr>";
        });
        output += "\n</table></html>";
        fs.writeFileSync(fileName, output);        
    },
    
    renumber: function(collection) {
        var lastAddress = "";
        var position = 0;
        var subposition = 1;
        collection.forEach( function(item) {
            if (lastAddress!=item.mappableAddress.toLowerCase()) {
                position++;
                subposition = 1;
                lastAddress = item.mappableAddress.toLowerCase();
            }
            item.full_order = position + (subposition/1000);
            subposition++;
        });
    }

    
}

