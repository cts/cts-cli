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
    "    cts install <URL>   \n\n" +
    "    The URL can be: \n" +
    "      * A <Type>/<Name> index into the official CTS mockup repository\n" +
    "      * A path to a mockup package file on your local filesystem \n" +
    "      * A URL to a mockup package file\n" +
    "      * A \"Github URL\" of the form github://user/repo/path/to/file.json\n" +
    "        that points to a mockup package file.\n\n"); 
};

CTSCLI.Install.prototype.run = function(argv) {
  if (argv._.length < 2) {
    this.help();
    return;
  }

  var fileref = argv._[1];

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
CTSCLI.Install.prototype.installPackage = function(spec) {
  if (typeof spec.files != 'undefined') {
    if (typeof spec.name != 'undefined') {
      var basepath = ['mockups', spec.name];
      this.installFiles(basepath, spec.files);
    }
  }
};

CTSCLI.Install.prototype.installFiles = function(relativePath, dirSpec) {
  var self = this;
  _.each(dirSpec, function(value, key) {
    if (_.isArray(value)) {
      var fileSpec = value[0];
      var fileKind = value[1];
      self.installFile(relativePath, key, fileSpec, fileKind);
    } else if (_.isObject(value)) {
      var pathClone = relativePath.slice(0);
      pathClone.push(key);
      self.installFiles(pathClone, value);
    } else {
      self.installFile(relativePath, key, value, 'utf8');
    }
  });
};

CTSCLI.Install.prototype.installFile = function(intoPath, fname, fileSpec, kind) {
  var self = this;
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

CTSCLI.Install.prototype.saveContents = function(intoPath, fname, contents, kind) {
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

CTSCLI.Install.prototype.ensurePath = function(p) {
  for (var i = 1; i < p.length + 1; i++) {
    var parts = p.slice(0, i);
    var pathStr = path.join.apply(this, parts);
    if (! fs.existsSync(pathStr)) {
      fs.mkdirSync(pathStr);
    }
  }
};
