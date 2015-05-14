#!/bin/sh

# See if the selenium webserver is already up, and start it if it isn't.
ps -ef | grep selenium-server | grep -v grep > /dev/null
if [ $? != 0 ]
then
  webdriver-manager start 2> /dev/null &
  not_started=1
  while [ $not_started == 1 ]
  do
    netstat -apn |& grep LISTEN | grep 4444 > /dev/null
    not_started=$?
  done
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
cd test/protractor; protractor ./conf.js

# Shut down webdriver-manager.
curl 'http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer'

echo 'Running unit tests.  Check the result in the browser, and quit'
echo 'the browser when finished.'

port=`grep port ../config.js | grep -oP '(\d+)'`
firefox http://localhost:${port}/test/scriptaculous_unit/autoComp_test.html \
        http://localhost:${port}/test/scriptaculous_unit/recordDataRequester_test.html

# Wait for firefox to load the page
sleep 3

# Shut down node.js (%n = background job n)
kill %2

