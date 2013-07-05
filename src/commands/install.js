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
