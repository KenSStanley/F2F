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
maxVoteScoreAllowed=0   #  KSS added this so that we could prioritize a voteScore for Sierra without giving her a bunch of older people
voteScoreWeight=0       # 
precinctMatchWeight=0 # 
ageMatchWeight=0        #
under40Weight=.0      #
over70Weight=-0.0      # 
hasPhoneWeight=0     # 
landlineScore=0      #
knownByWeight=0     #  should be -2 
precinctScoreWeight=0   # 
F2Fweight=-1            #  -1 if we have a true friends list
logMultiplier=1000        #  minimum weight needed to get any score from the name match
logDivider=2      #   this controls how quickly you ramp up to being considered 100% likely to be a friend
maxFriendScore=10.25 #  This is the most that you can get for being a friend

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

head -50 xxMatches.csv >xx50LongOutput.csv

