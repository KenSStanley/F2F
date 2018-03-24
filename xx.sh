#
# Usage: 
#  :1,$s/xx/SierraHardin/g
#  :1,$:s/TwoLineFriendsList/SH_FBwhatever/
#
birthYear=1953          #
birthMonth=8            #
birthDate=19            #
ward=MAN                #
wardNumber=1            #
wardLetter=A            #
maxVoteScoreAllowed=1   #  KSS added this so that we could prioritize a voteScore for Sierra without giving her a bunch of older people
voteScoreWeight=2       # 
precinctMatchWeight=0.5 # 
ageMatchWeight=1        #
under40Weight=.075      #
over70Weight=-0.05      # 
hasPhoneWeight=1.25     # 
landlineScore=-0.5      #
knownByWeight=-0.25     #  should be -2 
precinctScoreWeight=1   # 
F2Fweight=-1            #  -1 if we have a true friends list
logMultiplier=.1        #  minimum weight needed to get any score from the name match
logDivider=2      #   this controls how quickly you ramp up to being considered 100% likely to be a friend
maxFriendScore=1.25 #  This is the most that you can get for being a friend

rm -f xxMatches.csv 
node MatchFriendsAndScoreVoterList.js MansfieldAllFullHeuristicWithALLPhones TwoLineFriendsList  xxMatches \
$birthYear         \
$birthMonth           \
$birthDate           \
$ward               \
$wardNumber           \
$wardLetter           \
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
$logMultiplier \
$logDivider \
$maxFriendScore \
$landlineScore \
0

head -2000 xxMatches.csv >xx2000Matches.csv

rm -f xxMatches.csv 
node MatchFriendsAndScoreVoterList.js MansfieldAllFullHeuristicWithALLPhones TwoLineFriendsList  xxMatches \
$birthYear         \
$birthMonth           \
$birthDate           \
$ward               \
$wardNumber           \
$wardLetter           \
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
$logMultiplier \
$logDivider \
$maxFriendScore \
$landlineScore \
1

head -2000 xxMatches.csv >xx2000LongOutput.csv

