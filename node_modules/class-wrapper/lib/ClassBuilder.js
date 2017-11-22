/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/

/**
 * @file Implementation of [ClassBuilder]{@link ClassBuilder}
 *
 * @see {@link Class}
 * @see {@link SingletonClass}
 *
 * @author Valerii Zinchenko
 */

'use strict';

/**
 * Main class builder.
 * It takes the constructor function and wraps it to add few automated processes for constructing a new class.
 *
 * Properties and features:
 * - set the parent class
 * - save the inheritance chain
 * - define the classes/functions/objects that are going to be encapsulated into the resulting class. The last encapsulated object will have a precndence over the previose objects, even parent class. Only the own properties of the new class will have the highest precedence
 * - the reference to the parent class is stored in 'parent' property
 * - inherited methods are stored in class prototype object
 * - store default class properties in '__default' object where the objects will be copied, not shared
 *
 * @param {Function} InstanceBuilder - Function that defines how instances will be created, how constructor(s) will be executed
 * @param {Function} [Parent = Object] - Parent class
 * @param {Function | null} Constructor - Cconstructor function
 * @param {Object} props - Object of properties and methods for a new class. Property names that are used internally and will be ignored by encapsulation:
 * - __constructor
 * - __parent
 *
 * If some of the object has "__defaults" object, then all of it's properties will be treated as an object of default properties that a new class should have.
 * @param {Object | Function | Class | Array} [props.Encapsulate] - Define which object/function/class or an array of objects/functions/classes should be encapsulated into the new class
 * @returns {Function} Class
 *
 * @throws {Error} Incorrect input arguments. It should be: ClassBuilder(Function, [Function], Function | null, Object)
 * @throws {Error} Some of the items for encapsulation is incorrect. An item can be: Object, Function, Class
 *
 * @see {@link Class}
 * @see {@link SingletonClass}
 */
function ClassBuilder(InstanceBuilder, Parent, Constructor, props) {
	// Last input argument is an object of properties for a new class
	props = arguments[arguments.length - 1];

	// Second last input argument is a constructor function
	Constructor = arguments[arguments.length - 2];

	// Set default Parent class if it is not provided
	if (arguments.length === 3) {
		Parent = Object;
	}

	// Validate input arguments
	// --------------------------------------------------
	if (arguments.length < 3
		|| typeof InstanceBuilder !== 'function'
		|| Object.prototype.toString.call(Parent) !== '[object Function]'
		|| (Constructor !== null && typeof Constructor !== 'function')
		|| Object.prototype.toString.call(props) !== '[object Object]')
	{
		throw new Error('Incorrect input arguments. It should be: ClassBuilder(Function, [Function], Function | null, Object)');
	}
	// --------------------------------------------------


	// Prepare an array of what is going to be encapsulated into a new class
	// --------------------------------------------------
	var encapsulations = [];
	// Collect objects properties and methods of which will be encapsulated into a new class
	if (props.Encapsulate) {
		if (Object.prototype.toString.call(props.Encapsulate) === '[object Array]') {
			encapsulations = encapsulations.concat(props.Encapsulate);
		} else {
			encapsulations.push(props.Encapsulate);
		}

		// Remove "Encapsulate" property, because it is not need to be encapsulated
		delete props.Encapsulate;
	}
	// Put parent's defaults into an encapsulation stack
	if (Parent.prototype.__defaults) {
		encapsulations.unshift(Parent.prototype.__defaults);
	}
	// Put properties and methods for a new class into the encapsulation stack
	encapsulations.push(props);

	// Validate what is going to be encapsulated
	if (encapsulations.some(function(item) {
			var type = Object.prototype.toString.call(item);
			return type !== '[object Function]' && type !== '[object Object]';
		}))
	{
		throw new Error('Some of the items for encapsulation is incorrect. An item can be: Object, Function, Class');
	}
	// --------------------------------------------------



	// Clone class constructor function to prevent a sharing of instance builder function
	// --------------------------------------------------
	var Class;
	eval('Class = ' + InstanceBuilder.toString());
	// --------------------------------------------------


	// Inheritance chain
	// --------------------------------------------------
	// Derive a new class from a Parent class
	Class.prototype = Object.create(Parent.prototype);
	// Revert back the reference to the instance builder function
	Class.prototype.constructor = Class;

	// Store the reference to the constructor function
	if (Constructor) {
		Class.prototype.__constructor = Constructor;
	}
	// Create a storage for default properties
	Class.prototype.__defaults = {};

	// Store a reference to a parent's prototype object for internal usage
	Class.__parent = Parent.prototype;
	// --------------------------------------------------


	// Encapsulate properties and methods
	// --------------------------------------------------
	for (var n = 0, N = encapsulations.length; n < N; n++) {
		ClassBuilder.encapsulate(encapsulations[n], Class);
	}
	// --------------------------------------------------


	return Class;
}

/**
 * Encapsulate methods and properties from 'what' into 'to'.
 * If 'what' is a function then its prototype will be encapsulated.
 *
 * @param {Class | Object | Function} what - Object or Class that will be encapsulated.
 * @param {Class} to - Class where the methods and properties will be encapsulated.
 */
ClassBuilder.encapsulate = function(what, to) {
	if (Object.prototype.toString.call(what) === '[object Function]') {
		what = what.prototype;
	}

	for (var key in what) {
		// Note. 'constructor' is excluded to not override the real class constructor.
		if (what.hasOwnProperty(key)
			&& (key !== 'constructor' && key !== '__constructor' && key !== '__parent'))
		{
			var value = what[key];
			switch (Object.prototype.toString.call(value)) {
				// Store functions into "prototype"
				case '[object Function]':
					to.prototype[key] = value;
					break;

					// Clone objects and store the copies into "__defaults"
				case '[object Object]':
					if (key === '__defaults') {
						// NOTE. This is only for cases when some instance of ClassBuilder will be encapsulated.
						utils.deepCopy(to.prototype.__defaults, value);
					} else {
						if (!to.prototype.__defaults[key]) {
							to.prototype.__defaults[key] = {};
						}
						utils.deepCopy(to.prototype.__defaults[key], value);
					}
					break;

					// Store evererything else into "__defaults" container
				default:
					to.prototype.__defaults[key] = value;
			}
		}
	}
};
