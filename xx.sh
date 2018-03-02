#
# Usage: 
#  :1,$s/xx/SierraHardin/g
#  :1,$:s/TwoLineFriendsList/SH_FBwhatever/
#
maxVoteScoreAllowed=1   #  KSS added this so that we could prioritize a voteScore for Sierra without giving her a bunch of older people
voteScoreWeight=2       # 
precinctMatchWeight=0.5 # 
ageMatchWeight=1        #
under40Weight=.075      #
over70Weight=-0.05      # 
hasPhoneWeight=1.25     # 
knownByWeight=-0.25     #  should be -2 
precinctScoreWeight=1   # 
F2Fweight=-1            #  -1 if we have a true friends list

rm -f xxMatches.csv 
node MatchFriendsAndScoreVoterList.js MansfieldAllFullHeuristicWithALLPhones TwoLineFriendsList  xxMatches 1953 8 16  MAN 1 B \
$voteScoreWeight        \
$maxVoteScoreAllowed    \
$ageMatchWeight         \
$under40Weight     \
$over70Weight       \
$hasPhoneWeight      \
$precinctScoreWeight  \
$F2Fweight           \
$precinctMatchWeight  \
$knownByWeight        \
0

head -2000 xxMatches.csv >xx2000Matches.csv

rm -f xxMatches.csv 
node MatchFriendsAndScoreVoterList.js MansfieldAllFullHeuristicWithALLPhones TwoLineFriendsList xxMatches 1953 8 16  MAN 1 B \
$voteScoreWeight        \
$maxVoteScoreAllowed    \
$ageMatchWeight         \
$under40Weight     \
$over70Weight       \
$hasPhoneWeight      \
$precinctScoreWeight  \
$F2Fweight           \
$precinctMatchWeight  \
$knownByWeight        \
1

head -2000 xxMatches.csv >xx2000LongOutput.csv

