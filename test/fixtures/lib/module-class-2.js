/*!
 * test/fixtures/src/module-class-2.js
 * 
 * Copyright (c) 2014
 */

define(function () {


/* -----------------------------------------------------------------------------
 * ModuleClass2
 * ---------------------------------------------------------------------------*/

/**
 * @global
 * @public
 * @constructor
 *
 * @desc Class used to test jsdoc templating. This class will start very minimal
 * and grow as various documenting use cases become apparent.
 *
 * @example
 * var module = new ModuleClass2({
 *   prop1: 'super duper important'
 *   prop2: 'ehhh'
 * });
 *
 * @param {object} opts - ModuleClass2 options.
 * @param {string} opts.prop1 - A very import property.
 * @param {string} opts.prop2 - A less important property.
 */
var ModuleClass2 = function (opts) {

};


/* -----------------------------------------------------------------------------
 * api
 * ---------------------------------------------------------------------------*/

/**
 * @public
 * @memberof ModuleClass2
 *
 * @desc A method that accepts some arguments and returns something.
 *
 * @example
 * module.method('string', [0, 1], {
 *   prop: 'value'
 * }, function () {});
 *
 * @param {striing} str - A primitive string.
 * @param {Array} arr - An array of some numbers.
 * @param {Object} obj - Props and values yo.
 * @param {Function} callback - Callback after you have done something sweet.
 *
 * @returns {string} A modified string.
 */
ModuleClass2.prototype.method = function (str, arr, obj, callback) {

};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

return ModuleClass2;


});