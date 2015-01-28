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
      theme: theme
    });
  });


  /* ---------------------------------------------------------------------------
   * _renderDocs()
   * -------------------------------------------------------------------------*/

  describe('_renderDocs()', function () {

    it('Should return built documentation.', function (done) {
      this.easydocs._renderDocs(function (err, docs) {
        assert.equal(docs, '<h1>ModuleClass</h1>');
        done();
      });
    });

  });


  /* ---------------------------------------------------------------------------
   * _createPages()
   * -------------------------------------------------------------------------*/

  describe('_createPages()', function () {

    afterEach(function () {
      rimraf.sync('./test/fixtures/docs');
    });

    it('Should write built pages to specified dest.', function (done) {
      this.easydocs._createPages('easydocs', function (err) {
        var contents = fs.readFileSync('./test/fixtures/docs/index.html', 'utf8');

        assert.equal(contents, 'easydocs\n');
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