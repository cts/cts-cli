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


