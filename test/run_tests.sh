#!/bin/bash

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

if [ "$1" != "skip_unit_tests" ]
then
  echo 'Running unit tests.  Check the result in the browser, and quit'
  echo 'the browser when finished.'

  port=`grep port test/config.js | grep -oP '(\d+)'`
  firefox http://localhost:${port}/test/scriptaculous_unit/autoComp_test.html \
          http://localhost:${port}/test/scriptaculous_unit/recordDataRequester_test.html
fi

shutdown_and_exit () {
  # Shut down node.js (%n = background job n)
  kill %1
  exit $code
}

grunt mochaTest
code=$?
if [ $code != "0" ]
then
  shutdown_and_exit
fi

# Now run the e2e tests
grunt protractor
code = $?
shutdown_and_exit
