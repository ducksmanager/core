LOAD DATA LOW_PRIORITY
LOCAL INFILE 'csv_results_dir/auteurs_histoires.csv'
INTO TABLE auteurs_histoires(personcode, storycode);

SHOW WARNINGS;
