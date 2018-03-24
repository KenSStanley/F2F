#
#  This script grabs data for select precincts and creates a csv file for them.  
#
#  npm install collections
#   tr '\r' '\n' < 2012precinct.txt  > 2012precinctLF2.txt converts <CR> to  <LF>
#   egrep -E "Ashland|Coshocton|Holmes|Huron|Knox|Knox|Lorain|Medina|Richland|Stark|Tuscarawas" 2012precinctLF2.txt >GibbsCounties2012.txt
#  https://github.com/openelections/openelections-data-oh has alot of data
#
#  Compute GibbsPrecincts
rm GibbsPrecincts
node readPrecinctFromStatePrecinctFile.js Precinct2016Gibbs GibbsPrecincts
#  Compute GibbsCandidates
rm GibbsCandidates
node ReadCandidatesWhoRanInASetOfPrecincts.js Precinct2016All GibbsPrecincts GibbsCandidates
#  cp GibbsCandidates 2016OH7Candidates
#  vi 2016OH7Candidates - delete all but those candidates whom we care the most about
#
#  
node collectDataForASetOfPrecincts.js Precinct2016All GibbsPrecincts 2016OH7Candidates voteTotalsForAllGibbsPrecictsAndCandidates 
