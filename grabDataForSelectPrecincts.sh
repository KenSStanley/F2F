#
#  This script grabs data for select precincts and creates a csv file for them.  
#
#  npm install collections
#
#  Compute GibbsPrecincts
node readPrecinctFromStatePrecinctFile.js Precinct2016Gibbs GibbsPrecincts
#  Compute GibbsCandidates
node ReadCandidatesWhoRanInASetOfPrecincts.js Precinct2016All GibbsPrecincts GibbsCandidates
node collectDataForASetOfPrecincts.js Precinct2016Gibbs GibbsPrecincts 2016OH7Candidates
