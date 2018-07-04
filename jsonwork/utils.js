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
        this.htmlTableDump(contents,"tempDump"+fileName+".html",
               ["turf", "full_order","sosId","name","age","mappableAddress"],
               "This is just to see if all sorted in the right order");
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
    },
    
    capWord: function(oneWord) {
        return oneWord.substring(0,1).toUpperCase() + oneWord.substring(1).toLowerCase();
    },
    
    capSentence: function(sentence) {
        sentence = sentence.trim();
        var pos = 0;
        var idx = sentence.indexOf(" ");
        var rslt = "";
        while (idx>=pos) {
            rslt += sentence.substring(pos,pos+1).toUpperCase(); 
            rslt += sentence.substring(pos+1,idx).toLowerCase();
            rslt += " ";
            pos = idx+1;
            idx = sentence.indexOf(" ", pos);
        }
        rslt += sentence.substring(pos,pos+1).toUpperCase(); 
        rslt += sentence.substring(pos+1).toLowerCase();
        return rslt;
    },

    csvParseLine: function(val) {
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
    
}

