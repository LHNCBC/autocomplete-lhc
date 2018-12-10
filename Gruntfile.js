module.exports = function(grunt) {
  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    protractor: 'grunt-protractor-runner'
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    protractor: {
      options: {
        configFile: 'test/protractor/conf.js'
      },
      chrome: {
        options: {
          args: {
          }
        }
      }
    }
  });
};
