#
#  run collectDemocraticMansfieldPrecincts.sh first to collect data from the 9 Dem Precincts
#
# mv ~/Downloads/RICHLAND.txt 24JUNE18RICHLAND.txt

# cp 24JUNE18RICHLAND.txt RichlandCountyVoterFile.csv
# egrep -E "MAN 1|MAN 2|MAN 3|MAN 4|MAN 5|MAN 5" RichlandCountyVoterFile.csv >>MansfieldAllPrecincts.csv
#

# head MansfieldAllPrecincts.csv > MansfieldAllPrecinctsHead.csv
rm MansfieldAllPrecinctsFewerColumns.csv
node snagDataForAllPrecinctsFromCountyVoterFile.js MansfieldAllPrecincts.csv MansfieldAllPrecinctsFewerColumns.csv
