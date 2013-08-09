module.exports = function(grunt) {

    // Syntax "!<whatever>" means - exclude whatever from the result set
    var sourceFiles = [
            "./Resources/public/js/apps/*.js", "!./Resources/public/js/apps/*-min.js", "!./Resources/public/js/apps/*-coverage.js",
            "./Resources/public/js/views/*.js", "!./Resources/public/js/views/*-min.js", "!./Resources/public/js/views/*-coverage.js",
            "./Resources/public/js/models/*.js", "!./Resources/public/js/models/*-min.js", "!./Resources/public/js/models/*-coverage.js"
        ],
        trashFiles = [
            "./Resources/public/js/apps/*-min.js", "./Resources/public/js/apps/*-coverage.js",
            "./Resources/public/js/views/*-min.js", "./Resources/public/js/views/*-coverage.js",
            "./Resources/public/js/models/*-min.js", "./Resources/public/js/models/*-coverage.js"
        ];

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: sourceFiles
        },
        uglify: {
            all: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        src: sourceFiles,
                        ext: '-min.js'   // Dest filepaths will have this extension.
                    }
                ]
            }
        },
        clean: {
            all: {
                src: trashFiles
            }
        },
        instrument : {
            files : sourceFiles
        },
        pkg: grunt.file.readJSON('package.json'),
        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.repository %>',
                logo: "http://ez.no/extension/ez_ezno/design/ezno_2011/images/ez-logo.png",
                options: {
                    paths: [
                        "./Resources/public/js/apps",
                        "./Resources/public/js/views",
                        "./Resources/public/js/models"
                    ],
                    outdir: 'api/'
                }
            }
        },
        shell: {
            livedoc: {
                command: 'yuidoc --server',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('ugly', ['jshint', 'uglify']);
    grunt.registerTask('test', ['concat', 'jasmine_node'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );

};