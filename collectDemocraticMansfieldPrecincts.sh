cp VoterFileHeader.csv MansfieldDemPrecincts.csv
cp RICHLAND23DEC17.txt RichlandCountyVoterFile.csv
head -1 RichlandCountyVoterFile.csv > MansfieldDemPrecincts.csv
egrep -E "MAN 4 - C|MAN 6 - D|MAN 6 - A|MAN 5 - B|MAN 4 - B|MAN 6 - B|MAN 4 - E|MAN 4 - D|MAN 3 - A" RichlandCountyVoterFile.csv >>MansfieldDemPrecincts.csv
mv MansfieldDemPrecincts.csv MansfieldDemPrec23DEC17.csv

rm MansfieldDemPrec23DEC17FewerColumns.csv
node snagDataFor9DemPrecinctsFromCountyVoterFile.js MansfieldDemPrec23DEC17.csv MansfieldDemPrec23DEC17FewerColumns.csv
