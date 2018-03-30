#
#  Choose which doors to knock on 
#
rm testOutputChooseDoorsToKnockOn.csv
node chooseDoorsToKnockOn.js testInputChooseDoorsToKnockOn.csv regressDoorsToAvoid.csv testOutputChooseDoorsToKnockOn.csv
diff regressTestOutputChooseDoorsToKnockOn.csv testOutputChooseDoorsToKnockOn.csv


