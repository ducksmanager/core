#!/bin/sh
rm -rf duck-estimator-db
ssh-keyscan github.com >> ~/.ssh/known_hosts
git clone git@github.com:bperel/duck-estimator-db.git
cd duck-estimator-db
mv ../dump.csv .

git add .
git commit -m "Bump dump"
git push origin master
