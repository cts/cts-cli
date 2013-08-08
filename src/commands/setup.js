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
    "      * Sets up tree sheets for the Jekyll blogging platform\n" +
    "    cts setup jekyll --new   \n" +
    "      * Sets up tree sheets for the Jekyll blogging platform and creates jekyll environment\n");
};

CTSCLI.Setup.prototype.run = function(argv) {
  var self = this;
  // argv._[0] == "setup" if we got here...
  // because cts-cli.js made that so.
  if (argv._.length == 2) {
    var envType = argv._[1];
    if (envType == 'jekyll') {
      var newJekyll = argv["new"];
      this.setupJekyll(newJekyll);
    } else {
      this.help();
    }
  } else {
    this.help();
  }
};

CTSCLI.Setup.prototype.setupJekyll = function(newJekyll) {
  if (typeof newJekyll == 'undefined') {
    newJekyll = false;
  }
  console.log("Checking for Jekyll environment..");
  if ((this.isJekyllEnvironment() && !newJekyll) || (!this.isJekyllEnvironment() && newJekyll)) {
    console.log("Installing Treesheets Jekyll theme");
    if (!newJekyll) {
      this.editConfig();
    } else {
      this.makeConfig();
      var contentUrl = "https://raw.github.com/cts/mockups/master/blog/_jekyll_content/package.json";
      CTSCLI.Utilities.fetchFile(
      contentUrl,
      function(str) {
        CTSCLI.Utilities.installPackage(
          contentUrl,
          JSON.parse(str),
          { backup: true }
        );
      },
      console.log);
    }

    // TODO(jessica)
    //  - Install the tree sheets + jekyll theme file (the one that essentially
    //    outputs a HTML page using the right microformat.

    // Make use of the CTSCLI.Utilities.installPackage function to fetch 
    // mockups/blog/_jekyll/package.json
    // BUT!!
    // Change (add an option to) CTSCLI.Utilities.installPackage so that we can
    // tell it to check for the existence of a file FIRST and, if it finds that file,
    // rename it to FILE-OLD.extension.
    //
    // I.e., right now if you already have _layouts/post.html and package.json specifies
    // that file, it will blow away your existing file. Add a parameter to the 
    // installPackage method so that instead it will move it to _layouts/post-OLD.html
    // first.
    //
    // call CTSCLI.Utilities.installPackage with a installInCurrentDirecory of TRUE

    // Somewhere..

    var jekyllUrl = "https://raw.github.com/cts/mockups/master/blog/_jekyll/package.json";
    CTSCLI.Utilities.fetchFile(
      jekyllUrl,
      function(str) {
        CTSCLI.Utilities.installPackage(
          jekyllUrl,
          JSON.parse(str),
          { backup: true }
        );
      },
      console.log);

    // STEP 2!!!!!!!!!!!!!!!!!!!!!!!!
    //  - This is going to be a bit tricky because it may involve opening up files
    //    and changing their contents (e.g., the _config.yml file) so we want to be
    //    extra safe and make backups of them.

    // Think about a good default.
    // This should probably be:
    // 1. Edit _config.yml to specify a theme
    // 2. Download that theme (mog, or whatever you want good default to be).
    //    Manually call installPackage for this with the URL of a theme package.
    // Look at install.js for how to grab a package and install it.
    // Both optional arguments are false for this one.


    // When done.. 
    // should be able to start with a brand new jekyll installation (no cts!)
    // call:
    // cts setup jekyll
    // and then you're using cts theme with a default theme of your choosing

    // When you modify the CTSCLI project, how do you RUN those modifications?
    // 1. always run "grunt" after you make a change
    //  (search for node grunt for install instructions)
    //
    // Note! any line numbers with errors are talking about release/cts-cli.js
    // you can look at this for a reference of what is wrong, but you'll have to fix
    // it in the src/ directory and then re-run grunt.

    // also, reemmber to run using ./cts-cli/bin/cts command instead of the global command
    // in your path (to make sure you are using the devleopment version)
    
    var mockupUrl = "https://raw.github.com/cts/mockups/master/blog/mog/package.json";
    CTSCLI.Utilities.fetchFile(
      mockupUrl,
      function(str) {
        CTSCLI.Utilities.installPackage(
          mockupUrl,
          JSON.parse(str),
          { basepath:["mockups", "mog"] }
        );
      },
      console.log);

  } else if (!this.isJekyllEnvironment() && !newJekyll) {
    console.log("Error: This doesn't seem to be a Jekyll environment.");
  } else if (this.isJekyllEnvironment() && newJekyll) {
    console.log("Error: This seems to already be a Jekyll environment.");
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
  // TODO: is this right?
  var currentDirectory = process.cwd();
  var configYml = path.join(currentDirectory, "_config.yml");
  
  return fs.existsSync(configYml);
};


CTSCLI.Setup.prototype.editConfig = function() {
  var currentDirectory = process.cwd();
  var configYml = path.join(currentDirectory, "_config.yml");
  fs.readFile(configYml, 'utf8', function (err,data) {
    if(err) { 
      console.log(err);
    } else {
      fs.renameSync(configYml, path.join(currentDirectory, "_config-old.yml"));
      var endOfLine = require('os').EOL;
      fs.writeFileSync(configYml, "theme: mog" + endOfLine + data);
    }
  });
};
CTSCLI.Setup.prototype.makeConfig = function() {
  var currentDirectory = process.cwd();
  var configYml = path.join(currentDirectory, "_config.yml");
  var endOfLine = require('os').EOL;
  fs.writeFileSync(configYml, "theme: mog");
};
