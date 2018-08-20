# F2F


- MatchFriendListToVoterList.js - I suspect that this is obsolete 
- MatchFriendsAndScoreVoterList.js - This code creates a list of voters for a friend to look through. It is generally focused on the nine Democratic Precincts, but can be adjusted to de-emphasize those, if we so choose.
- MatchVoterIDandAddColumns.js - Used to create the spreadsheet with all voters that at least one F2F volunteer knows and which volunteers knows this voter
- PriyathNickname.js - I think that this has been incorporated into MatchFriendsAndScoreVoterList.js
- ReadCandidatesWhoRanInASetOfPrecincts.js - used in grabDataForSelectPrecincts.sh to grab information related to the Gibbs-Harbaugh race 
- ReadPrecinctFromStatePrecinctFile.js - Uses a very different source of data to compute " a list of precinct identifiers that Gibbs recieved votes from"
- chooseDoorsToKnockOn.js - does not do much. Just picks doors where the household is, on average, neutral or Democratic
- chooseVotersToCanvas.js - I think that this puts new voters into a walk order 
- collectDataForASetOfPrecincts.js - I wrote this for the Gibbs/Harbaugh race
- orderBuildings.js - Adds new buildings to the walk order. called by orderBuildingsMAN4C.sh and orderBuildingsRegress.sh
- readAddressesFromPrecinctFile.js - called by readAddressesFromPrecinctFile.sh - just seesm to collect some records frmo the whole file
- readYoungPeopleFromPrecinctFile.js - called by readYoungPeopleFromPrecinctFile.sh - "Header and records of all voters under the age of 23 on April 13, 2018"
- snagDataFor9DemPrecinctsFromCountyVoterFile.js - called by snagDataFor9DemPrecinctsFromCountyVoterFile.sh - Collects a few columns from the voter file. Also has an option to select voters below a given age. As is, the file that it creates is too big for google spreadsheets.
- snagDataForAllPrecinctsFromCountyVoterFile.js - called by snagDataForAllPrecinctsFromCountyVoterFile.sh - Collects a few columns from the voter file.
