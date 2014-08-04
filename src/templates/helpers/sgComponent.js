'use strict';
 
// Node.js modules
var fs = require('fs');
var path  = require('path');
 
// node_modules
var grunt = require('grunt'),
    glob  = require('globule'),
    yfm   = require('assemble-yaml'),
    _     = require('lodash');
 
module.exports.register = function(Handlebars, options) {
  var assembleOpts = options || {};
 
  /**
    * @param {String} base template      Globbing pattern(s).
    * @param {String} partial template   Globbing pattern(s).
    */
  Handlebars.registerHelper('sgComponent', function (template, partial, options) {

    // Default options
    var opts = {
      cwd: '',
      src: '',
      glob: {}
    };
 
    options = _.defaults(options.hash, assembleOpts.sgComponent, opts);
 
    var partialContent, partialContext,
        cwd = path.join.bind(null, process.cwd(), options.cwd, ''),
        src = path.join.bind(null, process.cwd(), options.src, '');

    glob.find(src(partial), options.glob).map(function(path) {
      partialContext = yfm.extract(path).context;
      partialContent = yfm.extract(path).content;
      partial = partialContent;
    });

    return glob.find(cwd(template), options.glob).map(function(path) {
      var content = yfm.extract(path).content;
      return {
        path: path,
        context: processContext(grunt, partialContext),
        content: content
      };
    }).map(function (obj) {
      var template = Handlebars.compile(obj.content);
      Handlebars.registerPartial('sgComponentContent', partial);
      return new Handlebars.SafeString(template(obj.context));
    });
  });
 
  var processContext = function(grunt, context) {
    grunt.config.data = _.defaults(context || {}, _.cloneDeep(grunt.config.data));
    return grunt.config.process(grunt.config.data);
  };
};