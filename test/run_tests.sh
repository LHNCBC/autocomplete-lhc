#!/bin/sh

# The webdriver (selenium) server takes time to start,
# doesn't provide a status on whether it is running,
# and doesn't provide a way to stop it.  We could start
# it here, but that takes ~12s, and slows down testing,
# so we just do a test to see whether it is running.
ps -ef | grep selenium-server | grep -v grep > /dev/null
if [ $? != 0 ]
then
  echo 'Please start the selenium server with "webdriver-manager start"'
  echo 'before running this file.  If you have not run that before,'
  echo 'you will need to run "webdriver-manager update" first.  If'
  echo 'webdriver-manager is not in your path, please make sure'
  echo 'you have run "npm install" from the autocomp directory.'
  exit
fi

# Start node.js to serve a page that uses autocomp
test_dir=`dirname $0`
# Move to the autocomp directory (containing "test");
cd $test_dir
cd ..
node test/app.js &

# The test server is now running with its document root in the "autocomp"
# directory.  We need to copy the "bonk.mp3" file there because the
# autocompleter code expects that to be in the document root.
if [ ! -e bonk.mp3 ]
then
  echo Copying bonk.mp3 into the document root for the tests.
  cp soundmanager/bonk.mp3 bonk.mp3
fi

# Now run the tests
cd test; protractor ./conf.js

echo 'Running unit tests.  Check the result in the browser, and quit'
echo 'the browser when finished.'
firefox http://localhost:3000/test/scriptaculous_unit/autoComp_test.html

# Shut down node.js (%1 = background job 1)
kill %1
