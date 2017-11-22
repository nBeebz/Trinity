/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/

/**
 * @file Implementation of [singleton class]{@link SingletonClass} wrapper
 *
 * @see {@link ClassBuilder}
 * @see {@link Class}
 *
 * @author Valerii Zinchenko
 */

'use strict';

/**
 * Singleton class
 * This sets a default instance builder function of {@link ClassBuilder} to achieve the behaviour of a singleton class.
 * A creation of a first instance is controlled by {@link ParentConstructorFirst} function.
 *
 * @param {Function | null} Constructor - Class constructor. The second last argument
 * @param {Object} props - Defines the properties and methods for a new class. The last input argument
 * @param {Object | Function | Class | Array} [props.Encapsulate] - Define which object/function/class or an array of classes/functions/objects should be encapsulated into the new class
 * @returns {Function} Class
 *
 * @throws {Error} Incorrect input arguments. It should be: ClassBuilder(Function, [Function], Function | null, Object)
 * @throws {Error} Some of the items for encapsulation is incorrect. An item can be: Object, Function, Class
 *
 * @see {@link ClassBuilder}
 */
var SingletonClass = ClassBuilder.bind(null, function() {
	// Return instance if it is already exist
	if (this.constructor.instance) {
		return this.constructor.instance;
	}

	// Store new instance
	this.constructor.instance = this;

	ParentConstructorFirst.apply(this, arguments);
});
