#!/bin/bash

diff=`git diff | wc -l`
if [ $diff -ne 0 ]; then
  echo "There are uncommited changes. Aborting..."
  exit 1
fi

echo "Creating gh-pages branch..."
git checkout --orphan gh-pages

echo "Building app..."
npm run build

echo "Deploying app..."
git --work-tree dist add --all
git --work-tree dist commit -m gh-pages
git push origin HEAD:gh-pages --force

echo "Cleaning up..."
rm -rf dist
git checkout -f main
git branch -D gh-pages

echo "Done!"

