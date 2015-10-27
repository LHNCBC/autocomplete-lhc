module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dist: {
        files: [ {src: 'indexPreMin.html', dest: 'index.html'},
                 {src: ['autocomplete-lhc/source/*.css',
                        'autocomplete-lhc/source/*.png'],
                  dest: 'dist/autocomplete-lhc', expand: true, flatten: true,
                  cwd: 'bower_components'},
                 {src: ['autocomplete-lhc/source/*.css',
                        'autocomplete-lhc/source/*.png',
                        'jquery-ui/themes/ui-lightness/**'],
                  dest: 'dist/', expand: true, cwd: 'bower_components'} ]
      }
    },

     // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: 'indexPreMin.html'
      }
    },


    'useminPrepare': {
      options: {
        dest: '.'
      },
      html: 'indexPreMin.html'
    },

    usemin: {
      html: ['index.html']
    }
  });

  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('default', ['wiredep', 'useminPrepare', 'copy', 'concat', 'uglify', 'usemin']);
};
