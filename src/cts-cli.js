/*
 * CTS Command Line Interface
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
"     setup      Setups up Tree Sheet-based theming\n" +
"     install    Installs a mockup\n" +
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
  "install": new CTSCLI.Install(),
  "setup": new CTSCLI.Setup()
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

