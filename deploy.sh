#!/bin/bash

PROJECTDIR=$1
REPO=$2
SCRIPT=$3

cd projects
echo "----Kill forever process----"
forever stop --sourceDir=projects/$PROJECTDIR $SCRIPT

echo "----Download zip archive----"
git archive --format=zip --remote=$REPO --output=master.zip master

while [ ! -f master.zip ];
do
	sleep 1
done
# exit 0
echo "----Zip downloaded----"

if [ -d $PROJECTDIR ]; then
	echo "----Remove all files except modules----"
	cd $PROJECTDIR
	set --
	for f in *; do
		[ "$f" = "node_modules" ] || set -- "$@" "$f"
	done
	set -- "$@" ".gitignore"
	echo "$@"
	sudo rm -rf "$@"
	#exit 0
	cd ..
else
	echo "----Creating folder----"
	mkdir $PROJECTDIR
fi

echo "----Moving Zip----"
mv master.zip $PROJECTDIR
cd $PROJECTDIR

echo "----Unzipping download----"
unzip master.zip

echo "----Deleting zip----"
rm master.zip

echo "----Pruning modules----"
sudo npm prune

echo "----Installing node dependancies----"
sudo npm install

echo "----Start site----"
forever start $SCRIPT
