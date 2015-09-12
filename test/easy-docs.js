/*!
 * test/easy-docs.js
 * 
 * Copyright (c) 2014
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// core
var fs = require('fs');
var path = require('path');

// 3rd party
var _      = require('easy-utils');
var assert = require('chai').assert;
var rimraf = require('rimraf');

// lib
var Easydocs = require('../lib/easy-docs');
var theme    = require('./fixtures/build/theme/index');


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('easy-docs.js', function () {

  beforeEach(function () {
    this.easydocs = new Easydocs({
      root: './test/fixtures',
      src: './src',
      theme: theme
    });
  });


  /* ---------------------------------------------------------------------------
   * _buildOpts()
   * -------------------------------------------------------------------------*/

  describe('_buildOpts()', function () {

    it('Should clone opts.', function () {
      var original = { theme: {}, prop: 'val' };
      var cloned   = this.easydocs._buildOpts(original);

      original.prop = 'val2';
      assert.equal(cloned.prop, 'val');
    });

    it('Should merge in defaults.', function () {
      var opts = this.easydocs._buildOpts({ theme: {}, prop: 'val' });

      assert.ok(opts.root);
      assert.ok(opts.dest);
      assert.ok(opts.docs);
      assert.ok(opts.compile);
      assert.ok(opts.data);
      assert.ok(opts.contents);
      assert.ok(opts.pages);
    });

    it('Should manually add helpers.', function () {
      var helpers = {
        help1: function () {},
        help2: function () {}
      };

      var opts = this.easydocs._buildOpts({
        theme: { helpers: helpers }
      });

      assert.deepEqual(opts.theme.helpers, helpers);
      assert.notEqual(opts.theme.helpers, helpers);
    });

    it('Should standardize paths.', function () {
      var opts = this.easydocs._buildOpts({
        theme: {},
        root: './test/fixtures',
        dest: './dest',
        docs: './build/docs',
        src:  './src'
      });

      assert.equal(opts.root, path.join(__dirname, './fixtures'));
      assert.equal(opts.dest, path.join(__dirname, './fixtures/dest'));
      assert.equal(opts.docs, path.join(__dirname, './fixtures/build/docs'));
      assert.equal(opts.src, path.join(__dirname, './fixtures/src'));
    });

  });


  /* ---------------------------------------------------------------------------
   * _addPages()
   * -------------------------------------------------------------------------*/

  describe('_addPages()', function () {

    it('Should add `pages` to passed `data` prop of passed obj.', function (done) {
      var pages = { 'page1': true };
      var opts = { pages: pages, data: {} };

      this.easydocs._addPages(opts, function () {
        assert.deepEqual(opts.data.pages, pages);
        done();
      })
    });

  });


  /* ---------------------------------------------------------------------------
   * _addPkg()
   * -------------------------------------------------------------------------*/

  describe('_addPkg()', function () {

    it('Should add `pkg` property to `opts.data`.', function (done) {
      this.easydocs._addPkg(this.easydocs.opts, function (err) {
        assert.equal(this.easydocs.opts.data.pkg.name, 'test');
        done();
      }.bind(this));
    });

    it('Should add `pkg` into existing `opts.data`.', function (done) {
      this.easydocs.opts.data.existing = true;

      this.easydocs._addPkg(this.easydocs.opts, function (err) {
        assert.isTrue(this.easydocs.opts.data.existing);
        done();
      }.bind(this));
    });

  });


  /* ---------------------------------------------------------------------------
   * _addDocs()
   * -------------------------------------------------------------------------*/

  describe('_addDocs()', function () {

    it('Should attach built documentation to `opts.contents` as `easydocs`.', function (done) {
      var easydocs = this.easydocs;

      easydocs._addDocs(easydocs.opts, function (err) {
        var contents = easydocs.opts.contents.easydocs;
        assert.equal(contents, '<h1>ModuleClass</h1>');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _addData()
   * -------------------------------------------------------------------------*/

  describe('_addData()', function () {

    it('Should add `pages`, and `pkg` to `opts.data`.', function (done) {
      this.easydocs._addData(function () {
        assert.ok(this.easydocs.opts.data.pages);
        assert.ok(this.easydocs.opts.data.pkg);
        done();
      }.bind(this))
    });

  });


  /* ---------------------------------------------------------------------------
   * _mergeOpts()
   * -------------------------------------------------------------------------*/

  describe('_mergeOpts()', function () {

    it('Should return an object with specied props merge with pass opts.', function () {
      var opts = this.easydocs._mergeOpts({ src: './testing' }, ['src', 'root']);

      assert.deepEqual(opts, {
        'src': './testing',
        'root': this.easydocs.opts.root
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _buildPage()
   * -------------------------------------------------------------------------*/

  describe('_buildPage()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should write built page to specified dest.', function (done) {
      var page = this.easydocs.opts.pages[0];

      this.easydocs.opts.contents.easydocs = '<h1>ModuleClass</h1>';
      this.easydocs._buildPage(page, function (err) {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, '<h1>ModuleClass</h1>\n');
        done();
      });
    });

    it('Should add documention to contents if page src is specified.', function (done) {
      var page = this.easydocs.opts.pages[0];
      page.src = './lib/module-class-2.js';

      this.easydocs._buildPage(page, function (err) {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, '<h1>ModuleClass2</h1>\n');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _createPage()
   * -------------------------------------------------------------------------*/

  describe('_createPage()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should write built page to specified dest.', function (done) {
      var page = _.pick(this.easydocs.opts.pages[0], ['fileName', 'pageName',
        'sections']);
      var opts = _.pick(this.easydocs.opts, ['root', 'docs', 'dest', 'compile',
        'data', 'contents', 'theme']);

      this.easydocs.opts.contents.easydocs = '<h1>ModuleClass</h1>';
      this.easydocs._createPage(page, opts, function () {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, '<h1>ModuleClass</h1>\n');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _buildPages()
   * -------------------------------------------------------------------------*/

  describe('_buildPages()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should write built pages to specified dest.', function (done) {
      this.easydocs.opts.contents.easydocs = '<h1>ModuleClass</h1>';
      this.easydocs._buildPages(function (err) {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, '<h1>ModuleClass</h1>\n');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _build()
   * -------------------------------------------------------------------------*/

  describe('_build()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should should write built pages to specified dest.', function (done) {
      this.easydocs._build(function (err) {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, '<h1>ModuleClass</h1>\n');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _copyAssets()
   * -------------------------------------------------------------------------*/

  describe('_copyAssets()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should recursively copy assets.', function (done) {
      this.easydocs._copyAssets(function (err) {
        var contents1 = fs.readFileSync('./test/fixtures/docs/assets/asset.js', 'utf8');
        var contents2 = fs.readFileSync('./test/fixtures/docs/assets/nested/asset.js', 'utf8');
        
        assert.equal(contents1, 'var test = \'success\';');
        assert.equal(contents2, 'var test = \'success\';');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * generate()
   * -------------------------------------------------------------------------*/

  describe('generate()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should build pages and copy assets.', function (done) {
      this.easydocs.generate(function (err) {
        var assetContents = fs.readFileSync('./test/fixtures/docs/assets/asset.js', 'utf8');
        var pageContents  = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(assetContents, 'var test = \'success\';');
        assert.equal(pageContents, '<h1>ModuleClass</h1>\n');
        done();
      });
    });

  });

});