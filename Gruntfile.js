module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      default: {
        files: [{
          source: ['dist']
        }]
      }
    },

    copy: {
      dist: {
        files: [ {src: 'indexPreMin.html', dest: 'index.html'},
                 {src: ['autocomplete-lhc/source/*.png'],
                  dest: 'dist/', expand: true, flatten: true,
                  cwd: 'bower_components'} ]
      }
    },

    cssmin: {
      default: {
        files: [{
          dest: 'dist/demo.min.css',
          src: ['.tmp/concat/dist/demo.min.css']
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: 'indexPreMin.html'
      }
    },


    useminPrepare: {
      options: {
        dest: '.'
      },
      html: 'indexPreMin.html'
    },

    usemin: {
      html: ['index.html', 'docs.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-wiredep');

  grunt.registerTask('default', ['clean', 'wiredep', 'useminPrepare', 'copy',
    'concat', 'uglify', 'cssmin', 'usemin']);
};
