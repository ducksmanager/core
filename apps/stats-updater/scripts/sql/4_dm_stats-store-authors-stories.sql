LOAD DATA LOW_PRIORITY
LOCAL INFILE 'csv_results/auteurs_histoires.csv'
INTO TABLE auteurs_histoires;

SHOW WARNINGS;
