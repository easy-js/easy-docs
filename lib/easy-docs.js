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
 * @param {string} [opts.docs='./build/docs'] - Root directory for
 *   `page.sections`.
 * @param {string} [opts.dest='./docs'] - Directory path specifying where to
 *   output documentation.
 * @param {boolean} [opts.compile=true] - Boolean indicating if `.md` files
 *   should be compiled to html.
 * @param {object} [opts.contents={}] - Object holding section contents to be
 *   included in pages.
 * @param {object} [opts.data={}] - Data to pass to templates.
 * @param {string} opts.src - Path of file(s) to document (accepts directory or
 *   file path).
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
  if (!opts || !opts.theme) {
    throw new Error('missing required opts.');
  }

  // clone, merge in defaults, standardize paths, etc..
  this.opts = this._buildOpts(opts);

  // avoid ungly scoping issues.
  _.bindPrototypes(this);
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
 * @desc Return a new object which is the result of cloning specified options,
 * merging in defaults, and standardizing paths.
 *
 * @param {object} opts - Easydocs opts.
 */
Easydocs.prototype._buildOpts = function (options) {
  var defaultPages = [{
    fileName: 'index.html',
    pageName: 'Documentation',
    sections: ['easydocs']
  }];

  // deepMerge props to a new object in order to avoid changing passed opts.
  var opts = _.jsonClone(options);
  opts = _.defaults(opts, {
    root     : process.cwd(),
    dest     : './docs',
    docs     : './build/docs',
    compile  : true,
    data     : {},
    contents : {},
    pages    : defaultPages
  });

  // copy over helpers (which are not cloned during jsonClone)
  if (options.theme.helpers) {
    opts.theme.helpers = _.extend({}, options.theme.helpers);
  }

  // standardize required global paths
  opts.root = path.resolve(opts.root);
  opts.dest = path.resolve(opts.root, opts.dest);
  opts.docs = path.resolve(opts.root, opts.docs);

  // standardize optional global paths
  if (opts.src) {
    opts.src  = path.resolve(opts.root, opts.src);
  }

  return opts;
};

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
  async.series([
    this._addData,
    this._buildPages
  ], callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Add globally available data before processing individual pages.
 *
 * @param {function} callback - Function to execute once all global data
 *   has been added.
 */
Easydocs.prototype._addData = function (callback) {
  var tasks = [
    this._addPages,
    this._addPkg
    //this._addVersions
  ];

  // If we have root level docs lets add them one time
  if (this.opts.src) {
    tasks.push(this._addDocs);
  }

  async.applyEach(tasks, this.opts, callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Add `opts.pages` to `opts.data` as `pages`.
 *
 * @param {function} callback - Function to execute once `pages` has been added
 *   to `opts.data`.
 */
Easydocs.prototype._addPages = function (opts, callback) {
  process.nextTick(function () {
    opts.data.pages = _.jsonClone(opts.pages);
    callback();
  });
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Read `package.json` and add resulting JSON to `opts.data` as `pkg`.
 *
 * @param {function} callback - Function to execute once `pkg` has been added
 *   to `opts.data`.
 */
Easydocs.prototype._addPkg = function (opts, callback) {
  var packagePath = path.resolve(opts.root, 'package.json');

  _.readJsonFile(packagePath, function (err, data) {
    opts.data.pkg = data;
    callback(err);
  });
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
Easydocs.prototype._addDocs = function (opts, callback) {
  var documentor = new Documentor(opts);

  documentor.render(function (err, documentation) {
    opts.contents.easydocs = documentation;
    callback(err);
  });
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Create/write all pages.
 *
 * @param {function} callback - Function to execute once each page been written.
 */
Easydocs.prototype._buildPages = function (callback) {
  async.each(this.opts.pages, this._buildPage, callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Merge selected passed options with selected global options.
 *
 * @param {object} opts - Opts to merge into global opts.
 * @param {object} propNames - Array of selected properties to retrieve from
 *   local and global opts.
 */
Easydocs.prototype._mergeOpts = function (opts, propNames) {
  var globalOpts = _.pick(this.opts, propNames);
  var localOpts  = _.pick(opts, propNames);

  return _.deepMerge(globalOpts, localOpts);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Build opts and create/write a single page.
 *
 * @param {object} pageObj - Page object
 * @param {function} callback - Function to execute once page been written.
 */
Easydocs.prototype._buildPage = function (pageObj, callback) {
  var page = _.pick(pageObj, ['fileName', 'pageName', 'sections']);
  var opts = this._mergeOpts(pageObj, ['root', 'docs', 'dest', 'compile',
    'src', 'data', 'contents', 'theme']);

  var createPage = _.bind(this._createPage, this, page, opts);
  var addDocs    = _.bind(this._addDocs, this, opts);
  var tasks      = [createPage];

  // optional page specific documentation
  if (pageObj.src) {
    tasks.unshift(_.bind(this._addDocs, this, opts));
  }

  async.series(tasks, callback);
};

/**
 * @private
 * @memberof Easydocs
 *
 * @desc Create/write a single page.
 *
 * @param {object} pageObj - Page object.
 * @param {object} opts - Page opts.
 * @param {function} callback - Function to execute once page been written.
 */
Easydocs.prototype._createPage = function (pageObj, opts, callback) {
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
  var assetsSrc  = this.opts.theme.assets;

  mkdirp(assetsDest, function (err) {
    if (err) {
      return callback(err);
    }

    ncp.ncp(assetsSrc, assetsDest, callback);
  });
};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

module.exports = Easydocs;