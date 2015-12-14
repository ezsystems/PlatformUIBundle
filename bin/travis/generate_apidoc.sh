#! /bin/sh
# Script to generate the API doc and to push the generated
# to a repository in a given branch.
# This script expects the $GH_TOKEN variable to be set to a valid
# Github user token who is allowed to push on the target repository

JS_REST_CLIENT_DIR="platformui-javascript-api"
TRIGGER_COMMIT_MSG=`git log --oneline -1 $TRAVIS_COMMIT`
DOC_REPOSITORY="ezsystems/ezsystems.github.com"
DOC_BRANCH=master
GITHUB_USER="eZ Robot, I do what I'm told to..."
GITHUB_USER_EMAIL="ezrobot@ez.no"

grunt doc
git clone -q https://${GH_TOKEN}@github.com/${DOC_REPOSITORY}.git ../ezsystems.github.com > /dev/null

cd ../ezsystems.github.com

git config user.name "$GITHUB_USER"
git config user.email "$GITHUB_USER_EMAIL"

git checkout "$DOC_BRANCH"
rsync -av --checksum $TRAVIS_BUILD_DIR/api/ "$JS_REST_CLIENT_DIR/"

STATUS=`git status --porcelain`

if [ ! -z "$STATUS" ] ; then
    git add "$JS_REST_CLIENT_DIR"
    git commit -m "`echo "Updated PlatformUI API doc\n\nAfter:\n$TRIGGER_COMMIT_MSG"`"
    git pull --rebase
    git push origin $DOC_BRANCH -q 2> /dev/null
else
    echo "No change in the doc"
fi
