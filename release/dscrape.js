/**
* dscrape
 * Declarative Web Scraping Utility
 *
 * @author Ted Benson 
 * @copyright Ted Benson 2013
 * @license MIT <http://github.com/webcats/dscrape/blob/master/LICENSE.txt>
 * @link 
 * @module dscrape
 * @version 1.0.0
 */
(function() {

var path         = require('path');
var fs           = require('fs');
var jsdom        = require('jsdom');
var request      = require('request');
var prettyjson   = require('prettyjson');
var optimist     = require('optimist');

// Duct tape includes

// TODO(eob): Turn these into proper npm includes

lib = path.join(path.dirname(fs.realpathSync(__filename)), "..", "lib");

jquery = fs.readFileSync(
  path.join(lib, "jquery.js")).toString()
ctsjs = fs.readFileSync(
  path.join(lib, "cts.js")).toString()

/*
 * DScrape: Declarative Web Scraping.
 * Copyright 2013 Ted Benson <eob@csail.mit.edu>
 */
fs = require('fs');
path = require('path');
optimist = require('optimist');
url = require('url');

BANNER = "" +
"     ____  _____                             \n" +
"    / __ \\/ ___/______________ _____  ___   \n" +
"   / / / /\\__ \\/ ___/ ___/ __ `/ __ \\/ _ \\ \n" +
"  / /_/ /___/ / /__/ /  / /_/ / /_/ /  __/   \n" +
" /_____//____/\\___/_/   \\__,_/ .___/\\___/ \n" +
"  Declarative Web Scraping  /_/              \n" +
"                                             \n" +
"  by Ted Benson <eob@csail.mit.edu> | @edwardbenson \n" +
"                                             \n" +
"  Usage: dscrape <CTS File> <URL>            \n" +
"                                             \n" +
"    - <CTS File> can be either a file on your filesystem or a Github link \n" +
"      of the form github://user/repo/path/to/file.cts                     \n" +
"                                              \n" +
"  Optional Arguments:                         \n" +
"                                              \n" +
"    --format=[pretty, json]     Desired output format. Defaults to pretty.\n" +
"    --verbose                   Display detailed status information.\n" +
"    --debug                     Display debugging information.\n" +
"                                              \n" +
"  Example: \n" +
" \n" +
"    dscrape github://cts/dscrape/examples/reddit.cts \\ \n" +
"            http://www.reddit.com \n";

ERROR404 = "  You stepped in the stream\n" +
           "  but the water has moved on\n" +
           "  that file is missing.\n";

var showError = function(message) {
  console.log("\nError:\n");
  console.log(message);
  console.log("\n");
};

var printLine = function(line) {
  process.stdout.write(line + '\n');
};

/* 
 * Translates:
 *  github://user/repo/path/to/file
 * To:
 *  https://github.com/USER/REPO/blob/master/PATH/TO/FILE
 */
var githubUrlToRealUrl = function(url) {
  var parts = url.split("/");
  if (parts.length < 5) {
    return null;
  }
  parts.shift(); // bye http
  parts.shift(); // bye //
  var user = parts.shift();
  var repo = parts.shirt();
  var file = parts.join("/");
  return "https://github.com/" + user + "/" + repo + "/blob/master/" + file;
};

/* Omnibus file loading.
 */
var fetchFile = function(fileRef, cbSuccess, cbError) {
  if ((typeof fileRef === undefined) || (fileRef === "")) {
    cbError(ERROR404 + "Empty file spec.");
  } else {
    if (fileRef.indexOf("github://") === 0) {
      var url = githubUrlToRealUrl(fileRef);
      if (url === null) {
        cbError(ERROR404 + "  Invalid github URL: " + fileRef);
      } else {
        fetchRemoteFile(url, cbSuccess, cbError);
      }
    } else if ((fileRef.indexOf("http://") === 0) ||
               (fileRef.indexOf("https://") === 0)) {
      request({uri:fileRef}, function(err, response, body) {
        if (err) {
          cbError(ERROR404 + "  Could not fetch file\n" +
                  "  Response code: " + response.statusCode + "\n");
        } else {
          cbSuccess(body);
        }
      });
    } else {
      // Load from FS
      fs.readFile(fileRef, 'utf-8', function(err, data) {
        if (err) {
          cbError(ERROR404 + "  Coult not read file: " + fileRef + "\n" + err);
        } else {
          cbSuccess(data);
        }
      });
    }
  }
};

var doExtraction = function(ctsFile, html, opts, cbSuccess) {
  data = {};
  if (opts.verbose) {
    console.log("* Parsing HTML");
  }
  jsdom.env({
    html: html,
    src: [jquery, ctsjs],
    done: function(err, window) {
      var engine = new window.CTS.Engine();
      if (opts.verbose) {
        console.log("* Parsing CTS");
      }
      var blocks = window.CTS.Parser.parseBlocks(ctsFile);
      engine.rules._incorporateBlocks(blocks);
      if (opts.debug) {
        printLine(prettyjson.render(engine.rules.blocks));
      }
      if (opts.verbose) {
        console.log("* Recovering Data");
      }
      data = engine.recoverData(window.jQueryHcss('html'));
      cbSuccess(data, opts);
    }
  });
};

var printData = function(data, opts) {
  var formatted = "";
  if (opts.format == "json") {
    formatted = JSON.stringify(data);
  } else if (opts.format == "pretty") {
    formatted = prettyjson.render(data);
  }
  printLine(formatted);
};

exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 2) {
    optimist.showHelp();
    return false;
  }
  
  var ctsRef = argv._[0];
  var htmlRef = argv._[1];
  var format = "pretty";
  
  if (typeof argv.format != 'undefined') {
    format = argv.format;
  }

  var opts = {
    verbose: (argv.verbose === true),
    format: format,
    debug: (argv.debug === true)
  };

  if (opts.verbose) {
    console.log("* Fetching CTS file");
  }
  fetchFile(ctsRef, function(ctsFile) {
    if (opts.verbose) {
      console.log("* Fetching HTML file");
    }
    fetchFile(htmlRef, function(html) {
      doExtraction(ctsFile, html, opts, printData);
    }, showError);
  }, showError);
};

}).call(this);
