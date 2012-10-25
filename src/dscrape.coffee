# Copyright (c) 2012 Edward Benson
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# External dependencies.
fs             = require 'fs'
path           = require 'path'
jsdom          = require 'jsdom'
request        = require 'request'
prettyjson     = require 'prettyjson'

jquery = fs.readFileSync("./lib/jquery.js").toString()
catsjs = fs.readFileSync("./lib/cts.js").toString()

printLine = (line) -> process.stdout.write line + '\n'
printWarn = (line) -> process.stderr.write line + '\n'

# The help banner that is printed when `coffee` is called without arguments.
BANNER = '''
  Usage: dscrape cats-file url 
'''

cats = []
catData = []
url = ""

exports.run = ->
  if parseOptions()
    for cfile in cats
      contents = fs.readFileSync(cfile).toString()
      catData.push(contents)
    pullDataFromUrl(url, cats, scraped)

scraped = (data) ->
  printLine prettyjson.render(data)

parseOptions = ->
  opts = process.argv[2..]
  if opts.length < 2
    printWarn "Not enough arguments"
    usage()
    return false
  cats.push(opts[0])
  url = opts[1]
  return true

pullDataFromUrl = (theUrl, catsSheets, scraped) ->
  request {uri:theUrl}, (error, response, body) -> 
    if error and response.statusCode != 200
      printWarn "Error contacting " + url
      return {}
    return pullDataFromString(body, catsSheets, scraped)

pullDataFromString = (str, catsSheets, scraped) ->
  data = {}
  jsdom.env({
    html:str,
    src:[jquery,catsjs]
    done: (err, window) ->
      # Vrm. Start 'er up
      engine = new window.CTS.Engine()
      # Load up the cats files
      for sheet in catData
        blocks = window.CTS.Parser.parseBlocks(sheet)
        engine.rules._incorporateBlocks(blocks)
        #window.CTS.Cascade.attachSheet(sheet)
      console.log("Blocks")
      console.log("------")
      console.log("")
      printLine prettyjson.render(engine.rules.blocks)
      console.log("")
      console.log("")
      console.log("Data")
      console.log("----")
      console.log("")
      data = engine.recoverData(window.jQueryHcss('html'))
      scraped(data)
  })

usage = ->
  printLine BANNER
