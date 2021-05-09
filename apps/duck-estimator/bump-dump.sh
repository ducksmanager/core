#!/bin/sh
rm -rf duck-estimator-db
git clone https://"$GITHUB_TOKEN"@github.com/bperel/duck-estimator-db
cd duck-estimator-db
mv ../dump.csv .

git config user.name "$GITHUB_NAME"
git config user.email "$GITHUB_EMAIL"
git add .
git commit -m "Bump dump"
git push origin master
