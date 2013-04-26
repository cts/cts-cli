(function() {

var path         = require('path');
var fs           = require('fs');
var jsdom        = require('jsdom');
var request      = require('request');
var prettyjson   = require('prettyjson');
var optimist     = require('optimist');

// Duct tape includes

// TODO(eob): Turn these into proper npm includes

lib = path.join(path.dirname(fs.realpathSync(__filename)), "..", "lib");

ctsjs = fs.readFileSync(
  path.join(lib, "cts.js")).toString()
