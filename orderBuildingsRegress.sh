#
#
#
rm orderedTurf4CoutPENN.csv
node orderBuildings.js OrderedTurfMan4CPENN.csv NewAddressesMan4cGeocodedPENN.csv orderedTurf4CoutPENN.csv true
diff orderedTurf4CoutPENN.csv  orderedTurf4CoutPENNexpectedOutput.csv ||  echo "Regression test failed" 
echo "Regression test completed - if no failure notice, it probably worked"
