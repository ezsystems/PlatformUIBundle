var reworkUrl = require('rework-plugin-url');

module.exports = function(grunt) {
    var reportDir = "./Tests/report",
        instrumentDir = "./Tests/instrument",
        environment = process.env,
        sourceFiles = [ // Syntax "!<whatever>" means - exclude whatever from the result set
            "./Resources/public/js/apps/*.js", "!./Resources/public/js/apps/*-min.js",
            "./Resources/public/js/apps/extensions/*.js", "!./Resources/public/js/apps/extensions/*-min.js",
            "./Resources/public/js/apps/plugins/*.js", "!./Resources/public/js/apps/plugins/*-min.js",
            "./Resources/public/js/views/*.js", "!./Resources/public/js/views/*-min.js",
            "./Resources/public/js/views/fields/*.js", "!./Resources/public/js/views/fields/*-min.js",
            "./Resources/public/js/views/universaldiscovery/*.js", "!./Resources/public/js/views/universaldiscovery/*-min.js",
            "./Resources/public/js/views/actions/*.js", "!./Resources/public/js/views/actions/*-min.js",
            "./Resources/public/js/views/tabs/*.js", "!./Resources/public/js/views/actions/*-min.js",
            "./Resources/public/js/views/navigation/*.js", "!./Resources/public/js/views/navigation/*-min.js",
            "./Resources/public/js/views/serverside/*.js", "!./Resources/public/js/views/serverside/*-min.js",
            "./Resources/public/js/views/services/*.js", "!./Resources/public/js/views/services/*-min.js",
            "./Resources/public/js/views/services/plugins/*.js", "!./Resources/public/js/views/services/plugins/*-min.js",
            "./Resources/public/js/models/*.js", "!./Resources/public/js/models/*-min.js",
            "./Resources/public/js/models/structs/*.js", "!./Resources/public/js/models/structs/*-min.js",
            "./Resources/public/js/extensions/*.js", "!./Resources/public/js/extensions/*-min.js",
            "./Resources/public/js/external/*.js", "!./Resources/public/js/external/*-min.js",
            "./Resources/public/js/services/*.js", "!./Resources/public/js/services/*-min.js",
            "./Resources/public/js/helpers/*.js", "!./Resources/public/js/helpers/*-min.js"
        ],
        testFiles = [
            "./Tests/js/**/*.js",
        ],
        trashFiles = [
            "./Resources/public/js/apps/*-min.js",
            "./Resources/public/js/apps/extensions/*-min.js",
            "./Resources/public/js/apps/plugins/*-min.js",
            "./Resources/public/js/views/*-min.js",
            "./Resources/public/js/views/fields/*-min.js",
            "./Resources/public/js/views/navigation/*-min.js",
            "./Resources/public/js/views/services/*-min.js",
            "./Resources/public/js/views/services/plugins/*-min.js",
            "./Resources/public/js/models/*-min.js",
            "./Resources/public/js/models/structs/*-min.js",
            "./Resources/public/js/extensions/*-min.js",
            "./Resources/public/js/external/*-min.js",
            "./Resources/public/js/services/*-min.js",
            "./Resources/public/js/helpers/*-min.js",
            "./Resources/public/js/views/actions/*-min.js",
            "./Resources/public/js/views/tabs/*-min.js",
            instrumentDir,
            reportDir
        ],
        fontsDir = "Resources/public/fonts/",
        alloyBase = "vendor/ezsystems/platform-ui-assets-bundle/Resources/public/vendors/alloy-editor/",
        alloyDistAssets = alloyBase + "dist/alloy-editor/assets/",
        alloySkinBasePath = alloyBase + "src/ui/react/src/assets/sass/skin/",
        alloySkinCSS =alloyDistAssets + "alloy-editor-ez.css",
        fixFontsUrl;

    fixFontsUrl = function (url) {
        if ( url.indexOf("fonts/") !== 0 ) {
            return url;
        }
        return '../../' + url;
    };

    environment.TZ = 'Europe/Paris';
    environment.LC_TIME = 'en_US';

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
                logo: "http://ez.no/extension/ez_ezno/design/ezno_2014/images/ez-logo.png",
                options: {
                    paths: [
                        "./Resources/public/js/apps",
                        "./Resources/public/js/views",
                        "./Resources/public/js/models",
                        "./Resources/public/js/extensions",
                        "./Resources/public/js/external",
                        "./Resources/public/js/services",
                        "./Resources/public/js/helpers"
                    ],
                    outdir: 'api/'
                }
            }
        },
        shell: {
            grover: {
                command: 'grover --server -o "' + reportDir + '/junit.xml" --junit Tests/js/*/*.html Tests/js/*/*/*.html Tests/js/*/*/*/*.html',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        env: environment,
                    },
                }
            },
            groverCoverage: {
                command: 'grover --server --coverage --coverdir "' + reportDir + '" -S "?filter=coverage" Tests/js/*/*.html Tests/js/*/*/*.html Tests/js/*/*/*/*.html',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        env: environment,
                    },
                }
            },
            livedoc: {
                command: 'yuidoc --server 3000 --config yuidoc.json',
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            "alloy-generateskin": {
                command: 'gulp build-css',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: alloyBase,
                    },
                },
            }
        },
        copy: {
            "alloy-skin": {
                expand: true,
                cwd: alloySkinBasePath + '/ocean/',
                src: '**',
                dest: alloySkinBasePath + '/ez/',
            },
            "alloy-override": {
                expand: true,
                cwd: "Resources/sass/alloy/",
                src: "variables.scss",
                dest: alloySkinBasePath,
            },
            "alloy-font": {
                expand: true,
                cwd: alloyDistAssets + "fonts/",
                src: "*",
                dest: fontsDir,
            }
        },
        rework: {
            "alloy-fontpath": {
                files: {"Resources/public/css/external/alloy-editor-ez.css": alloySkinCSS},
                options: {
                    toString: {compress: false},
                    use: [reworkUrl(fixFontsUrl)],
                },
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            test: {
                files: [sourceFiles, testFiles, "Tests/js/**/*.html"],
                tasks: ["shell:grover"]
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-rework');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('ugly', ['jshint', 'uglify']);
    grunt.registerTask('test', ['jshint', 'shell:grover'] );
    grunt.registerTask('coverage', ['jshint', 'clean', 'instrument', 'shell:groverCoverage'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );
    grunt.registerTask('alloy-css', [
        'copy:alloy-skin', 'copy:alloy-override', 'shell:alloy-generateskin',
        'copy:alloy-font', 'rework:alloy-fontpath'
    ]);
};
