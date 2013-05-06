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
  var repo = parts.shirt();
  var file = parts.join("/");
  return "https://raw.github.com/" + user + "/" + repo + "/master/" + file;
};

/* Omnibus file loading.
 */
CTSCLI.Utilities.fetchFile = function(fileRef, cbSuccess, cbError) {
  if ((typeof fileRef === undefined) || (fileRef === "")) {
    cbError(CTSCLI.Utilities.ERROR404 + "Empty file spec.");
  } else {
    if (fileRef.indexOf("github://") === 0) {
      var url = CTSCLI.Utilities.githubUrlToRealUrl(fileRef);
      if (url === null) {
        cbError(CTSCLI.Utilities.ERROR404 + "  Invalid github URL: " + fileRef);
      } else {
        fetchRemoteFile(url, cbSuccess, cbError);
      }
    } else if ((fileRef.indexOf("http://") === 0) ||
               (fileRef.indexOf("https://") === 0)) {
      request({uri:fileRef}, function(err, response, body) {
        if (err) {
          cbError(CTSCLI.Utilities.ERROR404 + "  Could not fetch file\n" +
                  "  Response code: " + response.statusCode + "\n");
        } else {
          cbSuccess(body);
        }
      });
    } else {
      // Load from FS
      fs.readFile(fileRef, 'utf-8', function(err, data) {
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

