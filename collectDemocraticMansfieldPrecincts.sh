cp VoterFileHeader.csv MansfieldDemPrecincts.csv
egrep -E "MAN 4 - C|MAN 6 - D|MAN 6 - A|MAN 5 - B|MAN 4 - B|MAN 6 - B|MAN 4 - E|MAN 4 - D|MAN 3 - A" Mansfield.txt >>MansfieldDemPrecincts.csv

