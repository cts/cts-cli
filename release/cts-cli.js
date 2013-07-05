/**
* cts-cli
 * Cascading Tree Sheets command line interface
 *
 * @author Ted Benson 
 * @copyright Ted Benson 2013
 * @license MIT <http://github.com/cts/cts-cli/blob/master/LICENSE.txt>
 * @link 
 * @module cts-cli
 * @version 1.0.6
 */
(function() {

var path         = require('path');
var fs           = require('fs');
var jsdom        = require('jsdom');
var request      = require('request');
var prettyjson   = require('prettyjson');
var optimist     = require('optimist');
var url          = require('url');
var _            = require("underscore");

var lib = path.join(path.dirname(fs.realpathSync(__filename)), "..", "lib");

// Duct Tape Includes
// TODO(eob): Turn this into a proper include

var ctsjs = fs.readFileSync(path.join(lib, "cts.js")).toString();

if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
}

CTSCLI.Utilities = {};

CTSCLI.Utilities.BANNER = "" +
"    _________________ \n" +
"   / ____/_  __/ ___/  Cascading Tree Sheets \n" +
"  / /     / /  \\__ \\                         \n" +
" / /___  / /  ___/ /   Does for structure     \n" +
" \\____/ /_/  /____/    what CSS does for style. \n "+
"\n";

CTSCLI.Utilities.DIRECTORY = "https://raw.github.com/cts/dscrape/master/examples/directory.json";

CTSCLI.Utilities.EXAMPLES = "https://raw.github.com/cts/dscrape/master/examples/";

CTSCLI.Utilities.ERROR404 = "  You stepped in the stream\n" +
           "  but the water has moved on\n" +
           "  that file is missing.\n";

CTSCLI.Utilities.githubUrlToRealUrl = function(url) {
  var parts = url.split("/");
  if (parts.length < 5) {
    return null;
  }
  parts.shift(); // bye http
  parts.shift(); // bye //
  var user = parts.shift();
  var repo = parts.shift();
  var file = parts.join("/");
  return "https://raw.github.com/" + user + "/" + repo + "/master/" + file;
};

/* Omnibus file loading.
 */
CTSCLI.Utilities.fetchFile = function(fileRef, cbSuccess, cbError, kind) {
  if (typeof kind == 'undefined') {
    kind = 'utf-8';
  }
  if ((typeof fileRef === 'undefined') || (fileRef === "")) {
    cbError(CTSCLI.Utilities.ERROR404 + "Empty file spec.");
  } else {
    if (fileRef.indexOf("github://") === 0) {
      var url = CTSCLI.Utilities.githubUrlToRealUrl(fileRef);
      if (url === null) {
        cbError(CTSCLI.Utilities.ERROR404 + "  Invalid github URL: " + fileRef);
      } else {
        CTSCLI.Utilities.fetchFile(url, cbSuccess, cbError);
      }
    } else if ((fileRef.indexOf("http://") === 0) ||
               (fileRef.indexOf("https://") === 0)) {
      var settings = {
        uri: fileRef
      };

      if (kind == 'binary') {
        settings.encoding = null;
      }

      request(settings, function(err, response, body) {
        if (err) {
          cbError(CTSCLI.Utilities.ERROR404 + "  Could not fetch file\n" +
                  "  Response code: " + response.statusCode + "\n");
        } else {
          cbSuccess(body);
        }
      });
    } else {
      // Load from FS
      fs.readFile(fileRef, kind, function(err, data) {
        if (err) {
          cbError(CTSCLI.Utilities.ERROR404 + "  Coult not read file: " + fileRef + "\n" + err);
        } else {
          cbSuccess(data);
        }
      });
    }
  }
};

CTSCLI.Utilities.lookupTreesheet = function(forUrl, cbSuccess, cbError) {
  CTSCLI.Utilities.fetchTreesheetDirectory(function(directory) {
    var d = JSON.parse(directory);
    if (typeof d.treesheets != 'undefined') {
      for (var i = 0; i < d.treesheets.length; i++) {
        var regex = new RegExp(d.treesheets[i].regex, "i");
        if (forUrl.match(regex) !== null) {
          // Download the sheet
          CTSCLI.Utilities.fetchTreesheetExample(d.treesheets[i].filename, cbSuccess, cbError);
          return;
        }
      }
    }
    cbError("Couldn't find a treesheet to match this URL");
  }, cbError);
};

/* 
 * Translates:
 *  github://user/repo/path/to/file
 * To:
 *  https://github.com/USER/REPO/blob/master/PATH/TO/FILE
 */
CTSCLI.Utilities.fetchTreesheetDirectory = function(cbSuccess, cbError) {
  CTSCLI.Utilities.fetchFile(
      CTSCLI.Utilities.DIRECTORY,
      cbSuccess,
      cbError);
};

CTSCLI.Utilities.fetchTreesheetExample = function(filename, cbSuccess, cbError) {
  CTSCLI.Utilities.fetchFile(
      CTSCLI.Utilities.EXAMPLES + filename,
      cbSuccess,
      cbError);
};

CTSCLI.Utilities.showError = function(message) {
  console.log("\nError:\n");
  console.log(message);
  console.log("\n");
};

CTSCLI.Utilities.printLine = function(line) {
  process.stdout.write(line + '\n');
};

CTSCLI.Utilities.printData = function(data, opts) {
  var formatted = "";
  if (opts.format == "json") {
    formatted = JSON.stringify(data);
  } else if (opts.format == "pretty") {
    formatted = prettyjson.render(data);
  }
  CTSCLI.Utilities.printLine(formatted);
};

/**
 * Installs a mockup given a package.
 */
CTSCLI.Utilities.installPackage = function(specUrl, spec, opts) {
  if (typeof opts == 'undefined') {
    opts = {};
  }

  var basepath = [];
  if (typeof opts.basepath != 'undefined') {
    basepath = opts.basepath;
  }

  var backupFiles = false;
  if (opts.backupFiles) {
    backupFiles= true;
  }

  var parts = specUrl.split("/");
  parts.pop();
  var specpath = parts.join("/");
  if (typeof spec.files != 'undefined') {
    this.installFiles(specpath, basepath, spec.files);
  }
};

CTSCLI.Utilities.installFiles = function(remotePath, intoPath, dirSpec) {
  var self = this;
  _.each(dirSpec, function(value, key) {
    if (_.isArray(value)) {
      CTSCLI.Utilities.installFiles(remotePath, intoPath, value);
    } else if (_.isObject(value)) {
      _.each(value, function(newDirSpec, subdir) {
        var pathClone = intoPath.slice(0);
        pathClone.push(subdir);
        CTSCLI.Utilities.installFiles(remotePath, pathClone, newDirSpec);
      });
    } else {
      var pathClone = intoPath.slice(0);
      self.installFile(remotePath, pathClone, value, value, 'utf8');
    }
  });
};

CTSCLI.Utilities.installFile = function(remotePath, intoPath, fname, fileSpec, kind) {
  var self = this;
  if (typeof fileSpec == 'string') {
    fileSpec = remotePath + '/' + fileSpec;
  }
  CTSCLI.Utilities.fetchFile(fileSpec,
      function(contents) {
        self.saveContents(intoPath, fname, contents, kind);
      },
      function(error) {
        console.log(error);
      },
      kind
  );
};

CTSCLI.Utilities.saveContents = function(intoPath, fname, contents, kind) {
  this.ensurePath(intoPath);
  intoPath.push(fname);
  var fullPath = path.join.apply(this, intoPath);
  if (kind == 'binary') {
    // the contents is a buffer object
    var data = contents.toString('binary');
    fs.writeFileSync(fullPath, data, 'binary');
  } else {
    fs.writeFileSync(fullPath, contents, kind);
  }
};

CTSCLI.Utilities.ensurePath = function(p) {
  for (var i = 1; i < p.length + 1; i++) {
    var parts = p.slice(0, i);
    var pathStr = path.join.apply(this, parts);
    if (! fs.existsSync(pathStr)) {
      fs.mkdirSync(pathStr);
    }
  }
};

if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Scrape = function() {
};

CTSCLI.Scrape.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  SCRAPE\n" +
    "  ======\n\n" +
    "  Scrapes data from a web page.\n\n" +
    "  Usage: \n\n" +
    "    cts scrape <URL> [CTS File]            \n" +
    "                                             \n" +
    "    Both the URL and the CTS File can either be: \n" +
    "      * A path to a file on your local filesystem \n" +
    "      * A URL \n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.cts\n" +
    "\n" +
    "    If the [CTS File] argument is missing, DScrape will attempt to locate\n" +
    "    an appropriate scraper for your URL pattern, if one has been registered.\n" +
    "                                              \n" +
    "  Optional Arguments:                         \n" +
    "                                              \n" +
    "    --format=[pretty, json]     Desired output format. Defaults to pretty.\n" +
    "    --verbose                   Display detailed status information.\n" +
    "    --debug                     Display debugging information.\n" +
    "                                              \n" +
    "  Example: \n" +
    " \n" +
    "    cts scrape http://www.reddit.com \n\n" +
    "    cts scrape http://www.reddit.com github://cts/dscrape/examples/reddit.cts\n\n"); 
};

CTSCLI.Scrape.prototype.run = function(argv) {

  if (argv._.length < 2) {
    this.help();
    return;
  }

  var htmlRef = argv._[1];
  var ctsRef = null;
  var ctsLoader = null;

  if (argv._.length < 3) {
    // Need to look up CTS sheet
    ctsRef = htmlRef;
    ctsLoader = CTSCLI.Utilities.lookupTreesheet;
  } else {
    ctsRef = argv._[2];
    ctsLoader = CTSCLI.Utilities.fetchFile;
  }

  var format = "pretty";
  
  if (typeof argv.format != 'undefined') {
    format = argv.format;
  }

  var opts = {
    verbose: (argv.verbose === true),
    format: format,
    debug: (argv.debug === true)
  };

  var self = this;

  if (opts.verbose) {
    console.log("* Fetching CTS file");
  }
  ctsLoader(ctsRef, function(ctsFile) {
    if (opts.verbose) {
      console.log("* Fetching HTML file");
    }
    CTSCLI.Utilities.fetchFile(htmlRef, function(html) {
      self.performExtraction(ctsFile, html, opts, CTSCLI.Utilities.printData);
    }, CTSCLI.Utilities.showError);
  }, CTSCLI.Utilities.showError);
};

CTSCLI.Scrape.prototype.performExtraction = function(ctsFile, html, opts, cbSuccess) {
  data = {};
  if (opts.verbose) {
    console.log("* Parsing HTML");
  }
  jsdom.env({
    html: html,
    src: [ctsjs],
    done: function(err, window) {
      window.console = console;
      var engine = new window.CTS.Engine();
      if (opts.verbose) {
        console.log("* Parsing CTS");
      }
      var blocks = window.CTS.Parser.parseBlocks(ctsFile);
      engine.rules._incorporateBlocks(blocks);
      if (opts.debug) {
        CTSCLI.Utilities.printLine(prettyjson.render(engine.rules.blocks));
      }
      if (opts.verbose) {
        console.log("* Recovering Data");
      }
      data = engine.recoverData(window.jQueryHcss('html'));
      cbSuccess(data, opts);
    }
  });
};


if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Stitch = function() {
};

CTSCLI.Stitch.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  STITCH\n" +
    "  ======\n\n" +
    "  Stitches together a content document with a mockup document.\n\n" +
    "  Usage: \n\n" +
    "    cts stitch <CONTENT URL> [MOCKUP URL] [CTS File]        \n" +
    "                                             \n" +
    "    Both the URLs and the CTS File can either be: \n" +
    "      * A path to a file on your local filesystem \n" +
    "      * A URL \n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.cts\n" +
    "\n" +
    "    If the [CTS File] argument is missing, CTS CLI will attempt to locate\n" +
    "    an appropriate sheet for your mockup URL, if one has been registered.\n\n" +
    "    If the [Mockup URL] argument is missing, CTS CLI will inspect the content\n" +
    "    document for links to a mockup and CTS sheet embedded within.\n\n");
};

CTSCLI.Stitch.prototype.run = function(argv) {
  if (argv._.length < 3) {
    this.help();
    return;
  }
};


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
  // argv._[0] == "setup" if we got here...
  // because cts-cli.js made that so.
  if (argv._.length == 2) {
    var envType = argv._[1];
    if (envType == 'jekyll') {
      this.setupJekyll();
    } else {
      this.help();
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

    var packageUrl = "https://raw.github.com/cts/mockups/master/blog/_jekyll/package.json";
    CTSCLI.Utilities.fetchFile(
      fileref,
      function(str) {
        CTSCLI.Utilities.installPackage(
          packageUrl,
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
  // TODO: is this right?
  var currentDirectory = process.cwd();
  var configYml = path.join(currentDirectory, "_config.yml");
  return fs.existsSync(configYml);
};

if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Install = function() {
};

CTSCLI.Install.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  INSTALL\n" +
    "  =======\n\n" +
    "  Installs an HTML mockup.\n\n" +
    "  Usage: \n\n" +
    "    cts install <URL To Package File>   \n" +
    "    cts install <ThemeType> <ThemeName>\n\n" +
    "    The URL can be: \n" +
    "      * A path to a mockup package file on your local filesystem \n" +
    "      * A URL to a mockup package file\n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.json\n" +
    "        that points to a mockup package file.\n\n" +
    "    The <ThemeType> <ThemeName> is a reference into the official CTS Mockup\n" +
    "    repository on Github\n\n");
};

CTSCLI.Install.prototype.run = function(argv) {
  if (argv._.length < 2) {
    this.help();
    return;
  }
  var fileref;
  var self = this;
  
  if (argv._.length == 2) {
    fileref = argv._[1];
  } else if (argv._.length == 3) {
    fileref = "https://raw.github.com/cts/mockups/master/" + argv._[1] + "/" + argv._[2] + "/package.json";
  } else {
    this.help();
    return;
  }

  CTSCLI.Utilities.fetchFile(
      fileref,
      function(str) {
        var packageSpec = JSON.parse(str);
        var basepath = [];
        if (typeof packageSpec.name != 'undefined') {
          basepath = ['mockups', spec.name];
        }

        CTSCLI.Utilities.installPackage(fileref, packageSpec, {
          basepath: basepath
        });
      },
      console.log);
};

if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Fetch = function() {
};

CTSCLI.Fetch.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  FETCH\n" +
    "  =====\n\n" +
    "  Fetches the contents of a URL.\n\n" +
    "  Usage: \n\n" +
    "\n" +
    "    cts fetch <URL>      \n\n" +
    "    The URL can be: \n" +
    "      * A path to a file on your local filesystem \n" +
    "      * A URL \n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.cts\n\n");
};

CTSCLI.Fetch.prototype.run = function(argv) {
  if (argv._.length < 2) {
    this.help();
    return;
  }

  var fileref = argv._[1];

  CTSCLI.Utilities.fetchFile(fileref, console.log, console.log);
};



/*
 * CTS Command Line Interface
 * Copyright 2013 Ted Benson <eob@csail.mit.edu>
 */

MAINHELP = CTSCLI.Utilities.BANNER +
"  by Ted Benson <eob@csail.mit.edu> | @edwardbenson \n" +
"                                             \n" +
"   Usage: \n " +
"    \n" +
"     cts <COMMAND> [Optional Arguments] \n" +
"    \n" +
"   Supported Commands: \n" +
"    \n" +
"     scrape     Scrapes content from a web page\n" +
"     stitch     Stitches together web documents\n" +
"     setup      Setups up Tree Sheet-based theming\n" +
"     install    Installs a mockup\n" +
"     fetch      Fetches a web document\n" +
"     help       Provides documentation for a command \n" +
"    \n" +
"   To see documentation for a particular <COMMAND>, type: \n" +
"    \n" +
"     cts help <COMMAND>\n\n";

/**
 * Registry of commands supported by CTS CLI.
 */
CTSCLI.Commands = {
  "scrape": new CTSCLI.Scrape(),
  "stitch": new CTSCLI.Stitch(),
  "fetch": new CTSCLI.Fetch(),
  "install": new CTSCLI.Install(),
  "setup": new CTSCLI.Setup()
};

/**
 * Main function for CTS CLI.
 *
 * Parses arguments and performs help and command routing.
 */
exports.run = function() {
  // Show the HELP message if they didn't provide any arguments
  var argv = optimist.usage(MAINHELP).argv;
  if (argv._.length < 1) {
    optimist.showHelp();
    return false;
  } else {
    // They provided at least one.
    var command = argv._[0];
    if (typeof CTSCLI.Commands[command] != 'undefined') {
      CTSCLI.Commands[command].run(argv);
    } else if (command == "help") {
      if (argv._.length < 2) {
        optimist.showHelp();
      } else {
        var helpCommand = argv._[1];
        if (typeof CTSCLI.Commands[helpCommand] != "undefined") {
          CTSCLI.Commands[helpCommand].help();
        } else {
         CTSCLI.Utilities.printLine("Error: command unknown (" + helpCommand + ")");
         optimist.showHelp();
        }
      }
    } else {
      CTSCLI.Utilities.printLine("Error: command unknown (" + command + ")");
      optimist.showHelp();
    }
  }
};


}).call(this);
