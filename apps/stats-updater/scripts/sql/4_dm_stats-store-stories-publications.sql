LOAD DATA LOW_PRIORITY
LOCAL INFILE 'csv_results_dir/histoires_publications.csv'
INTO TABLE histoires_publications;

SHOW WARNINGS;
