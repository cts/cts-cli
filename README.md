DScrape: Declarative Web Scraping
=================================

Usage:
   dscrape <CTS File> <URL>


Development Setup
-----------------

You'll need the following tools to run DScrape:

  * Node.js
    Installation instructions at http://nodejs.org/

  * The JSDOM node module, which simulates the DOM API within a node JS process.
    On a Mac: `sudo npm install -g jsdom`

  * The Pretty JSON node module, which enables pretty-print of JSON data
    On a Mac: `sudo npm install -g prettyjson`

And the following tools to develop with DScrape:

  * Coffeescript
    Installation instructions at http://coffeescript.org/

Building the Project
--------------------

From the project root, type:

    coffee --compile --output lib/ src/

This will create lib/dscrape.js for you, using src/dscrape.coffee as source.
The bin/dscrape executable relies on this library.

Included Examples
-----------------

Run these examples from the project root.

  * Reddit
    ./bin/dscrape examples/reddit.cts http://www.reddit.com

Todo
----

Several TODOs for this project exist:

  * Enable output for multiple serialization formats, to be toggled via command
    line. e.g.: JSON, YAML, etc.
  * Identify (and resolve) issues with JSDOM that cause it to behave
    differently from the browser

