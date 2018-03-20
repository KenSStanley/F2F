#
#  This script grabs data for select precincts and creates a csv file for them.  
#
node readPrecinctFromStatePrecinctFile.js Precinct2016Gibbs GibbsPrecincts
node collectDataForASetOfPrecincts.js Precinct2016Gibbs GibbsPrecincts 2016OH7Candidates
