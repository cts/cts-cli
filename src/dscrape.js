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
"  Usage: \n" +
"\n" +
"    dscrape <URL> [CTS File]            \n" +
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
"    dscrape github://cts/dscrape/examples/reddit.cts \\ \n" +
"            http://www.reddit.com \n";

ERROR404 = "  You stepped in the stream\n" +
           "  but the water has moved on\n" +
           "  that file is missing.\n";

DIRECTORY = "https://raw.github.com/cts/dscrape/master/examples/directory.json";

EXAMPLES = "https://raw.github.com/cts/dscrape/master/examples/";

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
  return "https://raw.github.com/" + user + "/" + repo + "/master/" + file;
};

var fetchTreesheetDirectory = function(cbSuccess, cbError) {
  fetchFile(DIRECTORY, cbSuccess, cbError);
};

var fetchTreesheetExample = function(filename, cbSuccess, cbError) {
  fetchFile(EXAMPLES + filename , cbSuccess, cbError);
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

var lookupTreesheet = function(forUrl, cbSuccess, cbError) {
  fetchTreesheetDirectory(function(directory) {
    var d = JSON.parse(directory);
    if (typeof d.treesheets != 'undefined') {
      for (var i = 0; i < d.treesheets.length; i++) {
        var regex = new RegExp(d.treesheets[i].regex, "i");
        if (forUrl.match(regex) !== null) {
          // Download the sheet
          fetchTreesheetExample(d.treesheets[i].filename, cbSuccess, cbError);
          return;
        }
      }
    }
    cbError("Couldn't find a treesheet to match this URL");
  }, cbError);
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
  if (argv._.length < 1) {
    optimist.showHelp();
    return false;
  }
  
  var htmlRef = argv._[0];
  var ctsRef = null;
  var ctsLoader = null;

  if (argv._.length < 2) {
    // Need to look up CTS sheet
    ctsRef = htmlRef;
    ctsLoader = lookupTreesheet;
  } else {
    ctsRef = argv._[1];
    ctsLoader = fetchFile;
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

  if (opts.verbose) {
    console.log("* Fetching CTS file");
  }
  ctsLoader(ctsRef, function(ctsFile) {
    if (opts.verbose) {
      console.log("* Fetching HTML file");
    }
    fetchFile(htmlRef, function(html) {
      doExtraction(ctsFile, html, opts, printData);
    }, showError);
  }, showError);
};
