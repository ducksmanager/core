LOAD DATA LOW_PRIORITY
LOCAL INFILE 'coa_results_dir/auteurs_histoires.csv'
INTO TABLE auteurs_histoires;

SHOW WARNINGS;
