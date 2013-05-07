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

