#
#
#
rm -f shorterMergedOutput.csv
node /Users/kenstanley/GitRepository/github/F2F/MatchVoterIDandAddColumns.js ShorterLargeFile.csv regressFileOfVols shorterMergedOutput.csv
echo ""
echo "And now we diff this file with what we got on the last regression run"
echo ""
diff shorterMergedOutput.csv regressShorterMergedOutput.csv
