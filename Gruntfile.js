module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');
  var wiredep = require('wiredep');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      target: {
        files: [{
          expand: true,
          flatten: true,
          src: ['source/*png'],
          dest: 'dist/'
        },
        {
          expand: true,
          cwd: 'bower_components/jquery-ui/themes/ui-lightness',
          src: ['images/*'],
          dest: 'dist/'
        }]
      }
    },


    cssmin: {
      target: {
        files: [
          {
            src: ['source/auto_completion.css'],
            dest: 'dist/autocomplete-lhc.min.css',
          },
          {
            src: ['source/auto_completion.css',
                  'bower_components/jquery-ui/themes/ui-lightness/jquery-ui.min.css'],
            dest: 'dist/autocomplete-lhc_jQueryUI.min.css',
          }
        ]
      }
    },


    uglify: {
      options: { compress: true },
      my_target: {
        files: {
          // Minified version of just the autocomplete-lhc files
          'dist/autocomplete-lhc.min.js':
            wiredep({includeSelf: true, exclude: [/jquery/]}).js,
          // Minified version of the autocomplete-lhc files with the needed
          // jQuery-UI components.
          'dist/autocomplete-lhc_jQueryUI.min.js':
            wiredep({includeSelf: true, exclude: [/jquery(-ui)?\.js/]}).js,
          // Minified version of autocomplete-lhc and all its dependencies
          'dist/autocomplete-lhc_jQuery.min.js':
            wiredep({includeSelf: true, exclude: [/jquery-ui\.js/]}).js
        }
      }
    },


    shell: {
      run_tests: {
        command: './test/run_tests.sh'
      }
    }

  });

  grunt.registerTask('dist', ['copy', 'cssmin', 'uglify']);

  grunt.registerTask('test', ['dist', 'shell:run_tests']);


  // This task is just for debugging the "uglify" configuration
  grunt.registerTask('listDepJS', function() {
    console.log("\n\n" + wiredep(
      {includeSelf: true, exclude: [/jquery/]}).js.join("\n"));
    console.log("\n\n" + wiredep(
      {includeSelf: true, exclude: [/jquery(-ui)?\.js/]}).js.join("\n"));
    console.log("\n\n" + wiredep(
      {includeSelf: true, exclude: [/jquery-ui\.js/]}).js.join("\n"));
  });

};
