LOAD DATA LOW_PRIORITY
LOCAL INFILE 'csv_results_dir/histoires_publications.csv'
INTO TABLE histoires_publications
(storycode, publicationcode, issuenumber, @oldestdate)
SET oldestdate = IFNULL(STR_TO_DATE(@oldestdate, '%Y-%m-%d'), STR_TO_DATE(@oldestdate, '%Y-%m'));

SHOW WARNINGS;
