module.exports = function(grunt) {


    var reportDir = "./Tests/report",
        instrumentDir = "./Tests/instrument",
        sourceFiles = [ // Syntax "!<whatever>" means - exclude whatever from the result set
            "./Resources/public/js/apps/*.js", "!./Resources/public/js/apps/*-min.js",
            "./Resources/public/js/views/*.js", "!./Resources/public/js/views/*-min.js",
            "./Resources/public/js/views/fields/*.js", "!./Resources/public/js/views/fields/*-min.js",
            "./Resources/public/js/views/actions/*.js", "!./Resources/public/js/views/actions/*-min.js",
            "./Resources/public/js/models/*.js", "!./Resources/public/js/models/*-min.js"
        ],
        testFiles = [
            "./Tests/js/*/*/*.js",
            "./Tests/js/*/*/*/*.js"
        ],
        trashFiles = [
            "./Resources/public/js/apps/*-min.js",
            "./Resources/public/js/views/*-min.js",
            "./Resources/public/js/views/fields/*-min.js",
            "./Resources/public/js/models/*-min.js",
            "./Resources/public/js/views/actions/*-min.js",
            instrumentDir,
            reportDir
        ];

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: [sourceFiles, testFiles]
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
        instrument: {
            files : sourceFiles,
            options : {
                basePath : instrumentDir
            }
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
            grover: {
                command: 'grover --server Tests/js/*/*.html Tests/js/*/*/*.html',
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            groverCoverage: {
                command: 'grover --server --coverage --coverdir "' + reportDir + '" -S "?filter=coverage" Tests/js/*/*.html Tests/js/*/*/*.html',
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            livedoc: {
                command: 'yuidoc --server 3000 --config yuidoc.json',
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
    grunt.registerTask('test', ['jshint', 'shell:grover'] );
    grunt.registerTask('coverage', ['jshint', 'clean', 'instrument', 'shell:groverCoverage'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );

};