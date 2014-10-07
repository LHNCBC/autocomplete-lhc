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
cd $test_dir
node app.js &

# Now run the tests
protractor ./conf.js

# Shut down node.js (%1 = background job 1)
kill %1
