/**
 * Grunt Buildfile for Jailbreak Wordpress
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        banner: "/**\n" +
                "* <%= pkg.name %>\n" +
                " * <%= pkg.description %>\n" +
                " *\n" +
                " * @author Ted Benson \n" +
                " * @copyright Ted Benson <%= grunt.template.today('yyyy') %>\n" +
                " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
                " * @link <%= pkg.homepage %>\n" +
                " * @module <%= pkg.name %>\n" +
                " * @version <%= pkg.version %>\n" +
                " */\n"
      },
      dscrape: {
        src : [
          "src/fragments/prefix._js",
          "src/utilities.js",
          "src/commands/scrape.js",
          "src/commands/stitch.js",
          "src/commands/fetch.js",
          "src/cts-cli.js",
          "src/fragments/postfix._js",
        ],
        dest : "release/cts-cli.js"
      }
    },
    jshint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    qunit: {
      files: [
        "test/index.html"
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'concat']);
};

