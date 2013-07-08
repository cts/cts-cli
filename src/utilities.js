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

  var backup = false;
  if (opts.backupFiles) {
    backup= true;
  }

  var parts = specUrl.split("/");
  parts.pop();
  var specpath = parts.join("/");
  if (typeof spec.files != 'undefined') {
    this.installFiles(specpath, basepath, spec.files, backup);
  }
};

CTSCLI.Utilities.installFiles = function(remotePath, intoPath, dirSpec, backup) {
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
      self.installFile(remotePath, pathClone, value, value, 'utf8', backup);
    }
  });
};

CTSCLI.Utilities.installFile = function(remotePath, intoPath, fname, fileSpec, kind, backup) {
  var self = this;
  if (typeof fileSpec == 'string') {
    fileSpec = remotePath + '/' + fileSpec;
  }
  CTSCLI.Utilities.fetchFile(fileSpec,
      function(contents) {
        self.saveContents(intoPath, fname, contents, kind, backup);
      },
      function(error) {
        console.log(error);
      },
      kind
  );
};

CTSCLI.Utilities.saveContents = function(intoPath, fname, contents, kind, backup) {
  this.ensurePath(intoPath);
  //if file already exists, add "-old" to file name
  if (fs.existsSync(intoPath.push(fname)) && backup) {
    var extIndex = fname.indexOf(".");
    fname = fname.substring(0, extIndex)+"-old"+fname.substring(extIndex);
  }
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
