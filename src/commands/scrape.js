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

