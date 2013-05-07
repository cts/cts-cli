(function() {

var path         = require('path');
var fs           = require('fs');
var jsdom        = require('jsdom');
var request      = require('request');
var prettyjson   = require('prettyjson');
var optimist     = require('optimist');
var url          = require('url');
var _            = require("underscore");

var lib = path.join(path.dirname(fs.realpathSync(__filename)), "..", "lib");

// Duct Tape Includes
// TODO(eob): Turn this into a proper include

var ctsjs = fs.readFileSync(path.join(lib, "cts.js")).toString();
