#
# This regression test is not giong to work until we fix the date reporting and/or switch from today to a fixed date 
#
rm -f KensNewestMatches.csv 
node MatchFriendsAndScoreVoterList.js ShorterLargeFile KensFriends KensNewestMatches 1992 4 19  MAN 4 B 16 17 18
diff KensNewestMatches.csv RegressKensNewestMatches.csv 

