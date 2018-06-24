#
#  run collectDemocraticMansfieldPrecincts.sh first to collect data from the 9 Dem Precincts
#
mv ~/Downloads/RICHLAND.txt 24JUNE18RICHLAND.txt

cp 24JUNE18RICHLAND.txt RichlandCountyVoterFile.csv
egrep -E "MAN 4 - C|MAN 6 - D|MAN 6 - A|MAN 5 - B|MAN 4 - B|MAN 6 - B|MAN 4 - E|MAN 4 - D|MAN 3 - A" RichlandCountyVoterFile.csv >>MansfieldDemPrecincts.csv
#
rm MansfieldDemPrecinctsFewerColumns.csv
node snagDataFor9DemPrecinctsFromCountyVoterFile.js
