var process = require('process');
var path = require('path');
var fs = require('fs');

if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Setup = function() {
};

CTSCLI.Setup.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  SETUP\n" +
    "  =======\n\n" +
    "  Sets up your project to use tree sheet-based mockups.\n\n" +
    "  Supported setup commands: \n\n" +
    "    cts setup jekyll   \n" +
    "      * Sets up tree sheets for the Jekyll blogging platform\n");
};

CTSCLI.Setup.prototype.run = function(argv) {
  var self = this;
  if (argv._.length == 2) {
    var envType = argv._[1];
    if (envType == 'jekyll') {
      this.setupJekyll();
    } else {
      this.htlp();
    }
  } else {
    this.help();
  }
};

CTSCLI.Setup.prototype.setupJekyll = function() {
  console.log("Checking for Jekyll environment..");
  if (this.isJekyllEnvironment()) {
    console.log("Installing Treesheets Jekyll theme");

    // TODO(jessica)
    //  - Install the tree sheets + jekyll theme file (the one that essentially
    //    outputs a HTML page using the right microformat.
    //
    //  - This is going to be a bit tricky because it may involve opening up files
    //    and changing their contents (e.g., the _config.yml file) so we want to be
    //    extra safe and make backups of them.
    
  } else {
    console.log("Error: This doesn't seem to be a Jekyll environment.");
  }
};

/**
 * Checks for the existence of a _config.yml file as evidence that this directory
 * is a Jekyll directory.
 *
 * Returns:
 *  boolean    Whether or not the current working directory is a Jekyll environment.
 */
CTSCLI.Setup.prototype.isJekyllEnvironment = function() {
  var currentDirectory = process.cwd();
  var configYml = path.join(currentDirectory, "_config.yml");
  return fs.existsSync(configYml);
};
