module.exports = function(grunt) {
  var serverConf = require('./test/config');

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server'
  });

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

    express: {
      options: {
        port: process.env.PORT || serverConf.port
      },
      dev: {
        options: {
          script: 'test/app.js',
          background: true,
          delay: 5
        }
      },
      test: {
        options: {
          script: 'test/app.js',
          background: true,
          delay: 5
        }
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
    },


    shell: {
      cypress: {
        command: 'cypress run --config baseUrl=http://localhost:' + serverConf.port
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-wiredep');

  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('build', ['clean', 'wiredep', 'useminPrepare', 'copy',
    'concat', 'uglify', 'cssmin', 'usemin']);

  grunt.registerTask('test:e2e', ['express:test', 'wait',
    'shell:cypress']);

  grunt.registerTask('test', ['build', 'test:e2e']);

  grunt.registerTask('default', ['build']);
};
