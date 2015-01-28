/*!
 * test/fixtures/src/module-class.js
 * 
 * Copyright (c) 2014
 */

define(function () {


/* -----------------------------------------------------------------------------
 * ModuleClass
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
 * var module = new ModuleClass({
 *   prop1: 'super duper important'
 *   prop2: 'ehhh'
 * });
 *
 * @param {object} opts - ModuleClass options.
 * @param {string} opts.prop1 - A very import property.
 * @param {string} opts.prop2 - A less important property.
 */
var ModuleClass = function (opts) {

};


/* -----------------------------------------------------------------------------
 * api
 * ---------------------------------------------------------------------------*/

/**
 * @public
 * @memberof ModuleClass
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
ModuleClass.prototype.method = function (str, arr, obj, callback) {

};


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

return ModuleClass;


});