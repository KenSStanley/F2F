#
#  run snagDataForAllPrecinctsFromCountyVoterFile.js first to collect data from sll Mansfield Precincts
#
# mv ~/Downloads/RICHLAND.txt 24JUNE18RICHLAND.txt
under22only=true

head -1 23July18RICHLAND.txt > MansfieldAllPrecincts.csv
egrep -E "MAN 1|MAN 2|MAN 3|MAN 4|MAN 5|MAN 5|MAN 6" 23July18RICHLAND.txt >>MansfieldAllPrecincts.csv
#


rm MansfieldUnder22only.csv 
node snagDataForAllPrecinctsFromCountyVoterFile.js MansfieldAllPrecincts.csv MansfieldUnder22only.csv $under22only
