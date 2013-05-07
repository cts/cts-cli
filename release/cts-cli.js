/**
* cts-cli
 * Cascading Tree Sheets command line interface
 *
 * @author Ted Benson 
 * @copyright Ted Benson 2013
 * @license MIT <http://github.com/cts/cts-cli/blob/master/LICENSE.txt>
 * @link 
 * @module cts-cli
 * @version 1.0.3
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


if (typeof CTSCLI == "undefined") {
  CTSCLI = {};
} 

CTSCLI.Mockup = function() {
};

CTSCLI.Mockup.prototype.help = function() {
  console.log(CTSCLI.Utilities.BANNER + 
    "  MOCKUP\n" +
    "  ======\n\n" +
    "  Helps manage HTML mockup.\n\n" +
    "  Usage: \n\n" +
    "\n" +
    "    cts mockup install <URL>   \n\n" +
    "    The URL can be: \n" +
    "      * A <Type>/<Name> index into the official CTS mockup repository\n" +
    "      * A path to a mockup package file on your local filesystem \n" +
    "      * A URL to a mockup package file\n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.json\n" +
    "        that points to a mockup package file.\n\n"); 
};

CTSCLI.Mockup.prototype.run = function(argv) {
  if (argv._.length < 3) {
    this.help();
    return;
  }

  var command = argv._[1];
  var fileref = argv._[2];

  if (command != "install") {
    this.help();
    return;
  }

  var self = this;

  CTSCLI.Utilities.fetchFile(
      fileref,
      function(str) {
        self.installPackage(JSON.parse(str));
      },
      console.log);
};

/**
 * Installs a mockup given a package.
 *
 * TODO(eob): Implement.
 */
CTSCLI.Mockup.prototype.installPackage = function(spec) {
  if (typeof spec.files != 'undefined') {
    this.installFiles([], spec.files);
  }
};

CTSCLI.Mockup.prototype.installFiles = function(relativePath, dirSpec) {
  var self = this;
  _.each(dirSpec, function(value, key) {
    var pathClone = relativePath.slice(0);
    pathClone.push(key);
    if (_.isArray(value)) {
      var fileSpec = value[0];
      var fileKind = value[1];
      this.installFile(pathClone, fileSpec, fileKind);
    } else if (_.isObject(value)) {
      this.installFiles(pathClone, value);
    } else {
      this.installFile(pathClone, value, 'utf8');
    }
  });
};

CTSCLI.Mockup.prototype.installFile = function(intoPath, fileSpec, kind) {
  var self = this;
  CTSCLI.Utilities.fetchFile(fileSpec,
      function(contents) {
        self.saveContents(intoPath, contents, kind);
      },
      function(error) {
        console.log(error);
      },
      kind
  );
};

CTSCLI.Mockup.prototype.saveContents = function(intoPath, contents, kind) {
  var fullPath = path.join(intoPath);
  if (kind == 'binary') {
    // the contents is a buffer object
    var data = contents.toString('binary');
    fs.writeFileSync(fullPath, data, 'binary');
  } else {
    fs.writeFileSync(fullPath, contents, kind);
  }
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
 * DScrape: Declarative Web Scraping.
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
"     mockup     Utilities for managing mockups\n" +
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
  "mockup": new CTSCLI.Mockup()
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
