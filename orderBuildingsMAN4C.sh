#
#
#
rm orderedTurf4Cout.csv
node orderBuildings.js Mansfield4CAllAddresses.csv NewAddressesFromAuditorGeocoded.csv orderedTurf4Cout.csv

source orderBuildingsRegress.sh
