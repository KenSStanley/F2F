/**
 * 
 * Created by Ken Stanley on 3/24/18 - orderBuildings.js 
 *  
 *  orderBuilding.js takes two files. The first, orderTurfFileName, is a list of addresses each of
 *  which has been assigned to a turf and been given an ordering within that
 *  turf. The second, addressesToAddFileName, is a list of addresses that we
 *  wish to assign to a trud and give a reasonable ordering to. 
 *  
 *  orderBuildingsRegress.sh runs this code on small input files (<10 lines per
 *  file) 
 *
 *    
 * Inputs
 *    orderTurfFile - This file contains the order number for each of the building that has been ordered
 *      MUST BE SORTED and the the order numbers are consecutive integers. 
 *    GPSCoordinatesFile - This must include GPS coordinates for every building in this precinct 
 * 
 * Outputs:
 *    orderTurfOutputFile - This file contains the order number for each of the building that has been ordered
 *      
 * Algorithm:
 *    Read in the known ordering 
 *    For each building in the GPSCoordinatesFile that is not in the orderTurfFile:
 *      Compute the distance from this new building to every building in the set of ordered buildings
 *      Find the closest  building and the second closest building within the same turf
 *      Compute the distance between these two buildings. A
 *      HeadedUp = order(closest building) < order(second closest building) 
 *      If the distance between closest building and second closest building is less than the distance 
 *        from the new building to the second closest buiding, then
 *                   HeadedUp = !HeadedUp
 *
 */
var debugOutput = false; 
var lessDebugOutput = false; 
var evenlessDebug = false; 
var regressionTest = false; 
const fs = require('fs');
const sortedMap = require("collections/sorted-map");  //  npm install collections

const writeOutput = (text) => {
  fs.appendFile(orderTurfOutputFileName, text, (err) => {
    if (err) throw err;
  });
};


let orderTurfFileName = "orderTurf.csv"
let orderTurfOutputFileName = "orderTurfOut.csv" ;  
let addressesToAddFileName = "GPSCoordiantes.csv" ;  


// parse input arguments
process.argv.forEach(function (val, index, array) {
  if (array.length <= 4 && index == 0) {
    console.log("no input/output files specified. Defaults will be used");
  }
  if (index === 2) {
    if ( debugOutput ) { console.log('orderTurfFileName: ' + val); }
    orderTurfFileName = val;
  }
  if (index === 3) {
    if ( debugOutput ) { console.log('addressesToAddFileName: ' + val); }
    addressesToAddFileName = val;
  }
  if (index === 4) {
    if ( debugOutput ) { console.log('orderTurfOutFileName: ' + val); }
    orderTurfOutputFileName = val;
  }
  if (index === 5) {
    if ( debugOutput ) { console.log('orderTurfOutFileName: ' + val); }
    regressionTest =  val ;
  }
  
}
);

const squareIt = function( x ) { return x * x }; 

// hard coded for Mansfield's latitude. 
const computeDistance = function( latDiff, longDiff ) {
   return Math.sqrt(squareIt(364.74*1000*(latDiff)) + squareIt(276.27*1000*(longDiff))) ; 
}

//initialization and main function
const init = function() {

//  positions in the orderTurf file
  const turfPos = 0 ; 
  const addressPos = 1; 
  const orderPos = 2; 
  const indexPos = 9 ; // Ignored
  const latPos = 10; 
  const longPos = 11 ; 

//  positions in the gpsCoordinate file
  const GPSaddressPos = 0 ; 
  const GPSlatPos = 1; 
  const GPSlongPos = 2; 

  var orderTurfContents = fs.readFileSync(orderTurfFileName, 'utf8');
  var addressesToAddContents = fs.readFileSync(addressesToAddFileName, 'utf8');
//   var orderTurfOutput = orderTurfContents ; 
  let header = "Turf, address, order, index, lat, long "; 
  var outputContents = header + "\n" ; 

  var turfOrderAndGPS = [] ; 
  var allTurfOrderAndGPS = []; 
  var addressesToAddLines = addressesToAddContents.split("\n");
  var orderTurfLines= orderTurfContents.split("\n");
 
  var turfs = [] ;  
  var turfIndices = []; 
  let minTurf = 1000000; 
  let maxTurf = 0 ; 
  for (indexI = 0; indexI <100 ; indexI++ ) {
     turfs[indexI] = [] ; 
     turfIndices[indexI] = 0 ; 
  }
//
//   Split the Turf File into separate turfs
//
   for (indexI = 2; indexI <orderTurfLines.length-1 ; indexI++ ) { 
     let splitRow = orderTurfLines[indexI].split(","); 
     let turf = splitRow[turfPos] ; 
     if (lessDebugOutput) console.log( " turf = " + turf + " orderTurfLines[indexI] = " , orderTurfLines[indexI] ) ; 
     let address = splitRow[addressPos] ; 
     let order = splitRow[orderPos] ; 
     if (lessDebugOutput) console.log( " line 129 order = " , order ) ; 
     let lat = splitRow[latPos] ; 
     let long = splitRow[longPos] ; 
     minTurf = Math.min( minTurf, turf ) ; 
     maxTurf = Math.max( maxTurf, turf ) ; 
     let nameObject = {
        turf: turf,    // redundant but hamrless and conceviablay useful
        address: address,
        order: order,
        lat: lat, 
        long: long
        }
     if (lessDebugOutput) console.log( " turf = " + turf + " turfIndices[turf] = " + turfIndices[turf] ) ; 
     turfs[turf][turfIndices[turf]] = nameObject; 
     turfIndices[turf]++; 
   }

//
//   Take one GPS coordinate at a time
//
   if (evenlessDebug ) console.log(" addressesToAddLines.length = " + addressesToAddLines.length ) ; 
   for ( indexGPS = 1; indexGPS< addressesToAddLines.length-1; indexGPS++ ) { 
     if (evenlessDebug ) console.log(" indexGPS = " + indexGPS ) ; 
     let GPSsplitRow = addressesToAddLines[indexGPS].split(","); 
     let GPSaddress = GPSsplitRow[GPSaddressPos];
     let GPSlat = GPSsplitRow[GPSlatPos];
     let GPSlong = GPSsplitRow[GPSlongPos];

          if ( debugOutput) console.log(" GPSsplitrow = " + GPSsplitRow  + "\n" ) ;
     if ( lessDebugOutput) console.log(" GPSaddress = " , GPSaddress + "\n" ) ;
     if ( debugOutput) console.log(" GPSlat = " , GPSlat + "\n" ) ;
     if ( debugOutput) console.log(" GPSlong = " , GPSlong + "\n" ) ;

     let closestTurf = -13 ; 
     let minDist = 1000000 ; 
     if ( debugOutput) console.log(" GPSaddress = " , GPSaddress ) ; 
     let closestIndex = -13; 
//
//   find the building that is closest to this GPScoordinate in all of the turfs
//
     if ( debugOutput) console.log(" minTurf = " , minTurf ) ; 
     if ( debugOutput) console.log(" maxTurf = " , maxTurf ) ; 
     for ( indexTurf = minTurf; indexTurf<=maxTurf ; indexTurf++ ) { 
       if ( debugOutput) console.log(" new Error().lineNumber = " ,  154 ) ; 
       if ( debugOutput) console.log(" indexTurf = " , indexTurf )
       if ( debugOutput) console.log(" minDist = " , minDist )
       thisTurf = turfs[indexTurf]; 
       if ( debugOutput) console.log(" thisTurf.length = " , thisTurf.length )
       for (indexBldg = 0; indexBldg < thisTurf.length; indexBldg++ ) { 

       if ( debugOutput) console.log(" XYZ GPSlat = " , GPSlat )
       if ( debugOutput) console.log(" XYZ thisTurf[indexBldg].lat = " , thisTurf[indexBldg].lat )

          let latDiff = GPSlat - thisTurf[indexBldg].lat ; 
          let longDiff = GPSlong - thisTurf[indexBldg].long ; 
       if ( debugOutput) console.log(" DOWN HERE latDiff = " , latDiff )
       if ( debugOutput) console.log(" DOWN HERE longDiff = " , longDiff )
          distanceToThisBldg = computeDistance( latDiff, longDiff ) ; 
       if ( debugOutput) console.log(" DOWN HERE distanceToThisBldg = " , distanceToThisBldg )
          if ( distanceToThisBldg < minDist ) { 
	    closestTurf = indexTurf; 
            minDist = distanceToThisBldg; 
            closestIndex = indexBldg ; 
          }
       if ( debugOutput) console.log(" minDist = " , minDist )
       }
     }
     closestBldg = closestIndex; 
       if ( lessDebugOutput) console.log(" DOWN HERE closestBldg = " , closestBldg );
       if ( lessDebugOutput) console.log(" DOWN HERE closestTurf = " , closestTurf );
       if ( lessDebugOutput) console.log(" DOWN HERE turfs[closestTurf][closestBldg] = " + turfs[closestTurf][closestBldg].address ) ; 

     debugOutput = 0 ; 

     if (debugOutput) console.log( " line : ", Error().lineNumber ) ; 
     if ( minDist == 0 ) {
       // exact match = trivial 
       let address = turfs[closestTurf][closestBldg].address; 
       let lat = turfs[closestTurf][closestBldg].lat;
       let order = turfs[closestTurf][closestBldg].order;
     if (lessDebugOutput) console.log( " line 204 order = " , order ) ; 
       let long = turfs[closestTurf][closestBldg].long;
       let index = indexGPS;  
       let orderLineForThisBldg = closestTurf + "," + address + "," + order + "," + index + "," + lat + "," + long ; 
       outputContents = outputContents + orderLineForThisBldg + "\n" ; 
       if (lessDebugOutput) console.log( "exact match line : ", 234 ) ; 
     } else { 
       //     
       // find the second closest match in the same turf
       // Assume that the three bldgs are on the same street (this will usually be true) and hence in a straight line
       // If the new bldg is closer to the second bldg than the first bldg is, it is between the two. Otherwise it
       // it is on the other side of the first bldg from the second bldg. 
       //    
       //
       if (debugOutput) console.log( "NO exact match line : ", Error().lineNumber ) ; 
       secondClosestIndex = -13; 
       secondMinDist = 10000000 ; 
       secondBldgIndex = -13 ; 
       let firstBldgIndex = closestIndex ; 
       thisTurf = turfs[closestTurf]; 
       if ( debugOutput) console.log(" closestTurf = " , closestTurf )
       if ( lessDebugOutput) console.log(" thisTurf.length = " , thisTurf.length )
       if ( lessDebugOutput) console.log(" thisTurf = " , thisTurf )
       debugOutput = 0 ; 
       for (indexBldg = 0; indexBldg < thisTurf.length; indexBldg++ ) { 
          let latDiff = GPSlat - thisTurf[indexBldg].lat ; 
          let longDiff = GPSlong - thisTurf[indexBldg].long ; 
          distanceToThisBldg = computeDistance( latDiff, longDiff ) ; 
          if (debugOutput) console.log( "distanceToThisBldg = " , distanceToThisBldg ) ; 
          if ( ( distanceToThisBldg < secondMinDist ) && ( indexBldg != closestIndex ) ) { 
            secondMinDist = distanceToThisBldg; 
            secondBldgIndex = indexBldg ; 
          }
       }

        if ( lessDebugOutput) console.log("firstBldgIndex = " + firstBldgIndex + " thisTurf[firstBldgIndex] = " +  thisTurf[firstBldgIndex].address  ) ; 
        if ( lessDebugOutput) console.log("secondBldgIndex = " + secondBldgIndex + " thisTurf[secondBldgIndex] = " +  thisTurf[secondBldgIndex].address  ) ; 

       let firstOrder = Number(thisTurf[firstBldgIndex].order); 
       let secondOrder = Number(thisTurf[secondBldgIndex].order) ; 
//
//      First we have to figure out whether the new address is between the two
//      or on the other side of the closest index.
//        BldgDist = the distance between the closest and the second closest
//        buidings. If this is larger than the distance to the second closest
//        building, we assume that it is on the other side of the closest
//        building
//
//
//
         if ( lessDebugOutput) console.log(" thisTurf = " + thisTurf ) ;

       if ( lessDebugOutput) console.log(" firstOrder = " + firstOrder ) ; 
       if ( lessDebugOutput) console.log(" secondOrder = " + secondOrder ) ; 
       let headedUp = -0.5 ; 
       if ( firstOrder < secondOrder ) headedUp = 0.5 ; 

       let bldgLatDiff = thisTurf[firstBldgIndex].lat - thisTurf[secondBldgIndex].lat ; 
       let bldgLongDiff = thisTurf[firstBldgIndex].long - thisTurf[secondBldgIndex].long ; 
       let bldgDist = computeDistance( bldgLatDiff,bldgLongDiff ) ; 
       // On the off chance that more than one house gets added in this location, this prevents them 
       // from having the exact same value for order. We turn randomization off for regressoin testing. 
       if ( ! regressionTest ) headedUp = Math.random() * headedUp ;
       if ( bldgDist > secondMinDist ) {
            thisOrder = firstOrder  + headedUp ;
       } else {
            thisOrder = firstOrder  - headedUp ;
            
       }
       if (lessDebugOutput) console.log( "NO exact match line : ", Error().lineNumber ) ; 
       if  (lessDebugOutput) console.log( " headedUp = " +  headedUp +  " bldgDist = " + bldgDist + " secondMinDist = " + secondMinDist ) ; 
       if  (lessDebugOutput) console.log( " firstOrder = "  + firstOrder + " thisOrder = " + thisOrder ) ; 
 //      thisOrder = ( firstOrder + thisOrder ) / 2 ; 
       let orderLineForThisBldg = closestTurf + "," + GPSaddress + "," + thisOrder + "," + indexGPS + "," + GPSlat + "," + GPSlong ; 
      outputContents = outputContents + orderLineForThisBldg + "\n" ; 
     }
  }  // End of foreach building loop; 


  writeOutput( outputContents ) ; 
}


init();
