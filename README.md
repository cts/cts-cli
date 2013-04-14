DScrape: Declarative Web Scraping
=================================

    Usage:
        dscrape <CTS File> <URL>

    Optional Arguments:
        --format fmt    Specify an output format for data. Valid formats are:
                          json
                          pretty (default)

        --verbose       Include helpful status and debugging messages in output.
                        If this flag is turned off, you can simply pipe the
                        command output into a file for saving.

    The CTS File can either be a file on your filesystem or a "Github URL" of the
    form github://USER/REPO/path/to/file.cts. DScrape will fetch the CTS file remotely
    from Github and then apply it.

    Examples:
      Tries to load a scraper from the DScrape Scraper Repository:

       dscrape http://www.reddit.com

      Uses a scraper at a pre-defined Github location:
      
       dscrape http://www.reddit.com github://cts/dscrape/examples/reddit.cts

      Uses a scraper in a local file:

       dscrape http://www.reddit.com reddit.cts

Installing 
----------

First install **Node.js** (http://nodejs.org/), and then install DScrape with the Node package manager:

    npm install -g dscrape

Developing
-----------

Install the project dependencies by running `npm install` in the project root. THen 


And the following tools to develop with DScrape:

  * **Coffeescript**

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

    `./bin/dscrape examples/reddit.cts http://www.reddit.com`

Todo
----

Several TODOs for this project exist:

  * Enable output for multiple serialization formats, to be toggled via command
    line. e.g.: JSON, YAML, etc.
  * Identify (and resolve) issues with JSDOM that cause it to behave
    differently from the browser

