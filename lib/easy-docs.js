/*!
 * easy-docs.js
 * 
 * Copyright (c) 2014
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// core
var path = require('path');

// 3rd party
var _          = require('easy-utils');
var Documentor = require('easy-documentor');
var Page       = require('easy-page');
var async      = require('async');
var ncp        = require('ncp');
var mkdirp     = require('mkdirp');


/* -----------------------------------------------------------------------------
 * Easydocs
 * ---------------------------------------------------------------------------*/

/**
 * @public
 * @consturctor
 *
 * @desc Documentation builder utilizing jsdoc parser.
 *
 * @param {string} [opts.root=process.cwd()] - Root which all paths will be
 *   resolved relative to.
 * @param {string} [opts.src='./src'] - Directory path of files to document.
 * @param {string} [opts.docs='./build/docs'] - Root directory for
 *   `opts.sections`.
 * @param {string} [opts.dest='./docs'] - Directory path specifying where to
 *   output documentation.
 * @param {boolean} [opts.compile=true] - Boolean indicating if `.md` files
 *   should be compiled to html.
 * @param {object} [opts.sections={}] - Object holding section contents to be
 *   included in pages.
 * @param {object} [opts.data={}] - Data to pass to templates.
 * @param {object} opts.theme - Easydoc theme.
 * @param {array} opts.pages - Easydoc page.
 * @param {string} theme.assets - Path to theme assets directory.
 * @param {string} theme.docsTmpl - Path of template used by `easy-documentor`.
 * @param {string} theme.pageTmpl - Path of template used by `easy-page`.
 * @param {object} theme.partials - Object where keys represent partial names
 *   and values represent partial paths.
 * @param {object} theme.helpers - Object where keys represent halper names
 *   and values represent helper methods.
 * @param {object} page.fileName - File name where page contents will be
 *   written to.
 * @param {array} page.sections - Array of file names. Files will
 *   templated/compiled and passed to pageTmpl as `sections`
 */
var Easydocs = function (opts) {
  // theme is require
  if (!opts.theme) {
    throw new Error('`opts.theme` is required');
  }

  // deep clone to avoid changing passed opts
  this.opts = _.jsonClone(opts || {});
  this.opts = _.defaults(this.opts, {
    root: process.cwd(),
    src: './src',
    dest: './docs',
    docs: './build/docs',
    compile: true,
    data: {},
    sections: {},
    pages: [{
      fileName: 'index.html',
      sections: ['easydocs']
    }]
  });

  // helpers get erased in jsonClone
  this.opts.theme.helpers = opts.theme.helpers || {};

  // make sure paths are absolute
  this.opts.root = path.resolve(this.opts.root);
  this.opts.src  = path.resolve(this.opts.root, this.opts.src);
  this.opts.dest = path.resolve(this.opts.root, this.opts.dest);
  this.opts.docs = path.resolve(this.opts.root, this.opts.docs);

  // avoid ungly scoping issues.
  _.bindAll(this, 'generate', '_build', '_renderDocs', '_createPages',
    '_copyAssets');
};

/**
 * @public
 * @memberof Easydocs
 *
 * @desc Generate the documentation by writing out each page and copying
 * theme assets.
 *
 * @param {function} callback - Function to execute once documentation has
 *   been generated.
 */
Easydocs.prototype.generate = function (callback) {
  async.parallel([
    this._build,
    this._copyAssets
  ], callback);
};


/* -----------------------------------------------------------------------------
 * steps
 * ---------------------------------------------------------------------------*/

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Render docs and write pages.
 *
 * @param {function} callback - Function to execute once all pages have
 *   been written.
 */
Easydocs.prototype._build = function (callback) {
  async.waterfall([
    this._renderDocs,
    this._createPages
  ], callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Render documentation.
 *
 * @param {function} callback - Function to execute once documentation has
 *   been generated.
 */
Easydocs.prototype._renderDocs = function (callback) {
  var opts = this._opts('docsTmpl', ['root', 'src']);

  var documentor = new Documentor(opts);
  documentor.render(callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Create/write all pages.
 *
 * @param {function} callback - Function to execute once each page been written.
 */
Easydocs.prototype._createPages = function (documentation, callback) {
  var opts = this._opts('pageTmpl', ['root', 'docs', 'dest', 'data', 'compile',
    'sections']);

  // add pages to data for access to navigation
  opts.data.pages = this.opts.pages;

  // add docs as `easydocs`.
  opts.sections['easydocs'] = documentation;

  // loop and write each specified page
  async.each(this.opts.pages, _.bind(this._createPage, this, opts), callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Create/write a single page.
 *
 * @param {function} callback - Function to execute once page been written.
 */
Easydocs.prototype._createPage = function (opts, pageObj, callback) {
  // add selected page to data
  opts.data.pageName = pageObj.pageName;

  var page = new Page(pageObj, opts);
  page.create(callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Copy assets from theme to directory.
 *
 * @param {function} callback - Function to execute once assets have been
 *   copied over.
 */
Easydocs.prototype._copyAssets = function (callback) {
  var assetsDest = path.resolve(this.opts.dest, 'assets');

  mkdirp(assetsDest, function (err) {
    if (err) {
      return callback(err);
    }

    ncp.ncp(this.opts.theme.assets, assetsDest, callback);
  }.bind(this));
};


/* -----------------------------------------------------------------------------
 * utils
 * ---------------------------------------------------------------------------*/

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Create options for Documentor/Page instances.
 *
 * @param {string} tmpl - The name of the template to include (docTmpl or
 *   pageTmpl).
 * @param {array} options - Array of property names to pick from `opts`.
 */
Easydocs.prototype._opts = function (tmpl, options) {
  var opts = _.pick(this.opts, options);

  return _.extend(opts, {
    partials : this.opts.theme.partials,
    helpers  : this.opts.theme.helpers,
    tmpl     : this.opts.theme[tmpl]
  });
};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

module.exports = Easydocs;