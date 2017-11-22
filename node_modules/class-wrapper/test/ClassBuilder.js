/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/

'use strict';

suite('ClassBuilder', function() {
	suite('Input arguments are', function() {
		suite('incorrect when', function() {
			[
				{
					title: 'No arguments',
					input: []
				},
				{
					title: 'One argument',
					input: [1]
				}
			].concat(
				[undefined, null, false, 1, '', [], {}].map(function(type){
					return {
						title: 'type of instance builder function argument: ' + Object.prototype.toString.call(type),
						input: [type, {}]
					}
				}),
				[undefined, false, 0, '', [], {}].map(function(type){
					return {
						title: 'type of constructor: ' + Object.prototype.toString.call(type),
						input: [function(){}, type, {}]
					}
				}),
				[undefined, null, false, 1, '', [], function(){}].map(function(type){
					return {
						title: 'type of class properties: ' + Object.prototype.toString.call(type),
						input: [function(){}, null, type]
					}
				}),
				[undefined, null, false, 1, '', [], {}].map(function(type){
					return {
						title: 'type of a parent class: ' + Object.prototype.toString.call(type),
						input: [function(){}, type, null, {}]
					}
				})
			).forEach(function(testCase){
				test(testCase.title, function() {
					assert.throw(function() {
						ClassBuilder.apply(null, testCase.input);
					}, Error, 'Incorrect input arguments. It should be: ClassBuilder(Function, [Function], Function | null, Object)');
				});
			});
		});

		suite('correct with', function() {
			[
				{
					title: 'constructor function, without current class constructor function and object of properties and methods',
					input: [function(){}, null, {}]
				},
				{
					title: 'constructor function, current class constructor function and object of properties and methods',
					input: [function(){}, function(){}, {}]
				},
				{
					title: 'constructor function, parent class, no current class constructor function and object of properties and methods',
					input: [function(){}, function(){}, null, {}]
				},
				{
					title: 'constructor function, parent class, current class constructor function and object of properties and methods',
					input: [function(){}, function(){}, function(){}, {}]
				},
				{
					title: 'constructor function, parent class, objects/functions being encapsulated, no current class constructor function and object of properties and methods',
					input: [function(){}, function(){}, {}, function(){}, {}, {}, null, {}]
				},
				{
					title: 'constructor function, parent class, objects/functions being encapsulated, current class constructor function and object of properties and methods',
					input: [function(){}, function(){}, {}, function(){}, {}, {}, function(){}, {}]
				}
			].forEach(function(testCase){
				test(testCase.title, function() {
					assert.doesNotThrow(function() {
						ClassBuilder.apply(null, testCase.input);
					});
				});
			});
		});
	});

	suite('Encapsulated item is', function() {
		suite('incorrect', function(){
			[].concat(
				[true, 1, 'a'].map(function(type){
					return {
						title: 'type of an "Encapsulate" property: ' + Object.prototype.toString.call(type),
						input: type
					}
				}),
				[undefined, null, false, 1, '', []].map(function(type){
					return {
						title: 'type of some item in an array: ' + Object.prototype.toString.call(type),
						input: [function(){}, type, {}]
					}
				})
			).forEach(function(testCase){
				test(testCase.title, function(){
					assert.throw(function(){
						ClassBuilder.call(null, function(){}, null, {Encapsulate: testCase.input});
					}, Error, 'Some of the items for encapsulation is incorrect. An item can be: Object, Function, Class');
				});
			});
		});

		suite('correct or ignored', function(){
			[].concat(
				[undefined, null, false, 0, ''].map(function(type){
					return {
						title: 'type of an "Encapsulate" property that should be ignored: ' + Object.prototype.toString.call(type),
						input: type
					}
				}),
				[function(){}, {}].map(function(type){
					return {
						title: 'type of an "Encapsulate" property: ' + Object.prototype.toString.call(type),
						input: type
					}
				}),
				{
					title: 'an empty array of items',
					input: []
				},
				{
					title: 'an array of allowed types',
					input: [function(){}, {}]
				}
			).forEach(function(testCase){
				test(testCase.title, function(){
					assert.doesNotThrow(function(){
						ClassBuilder.call(null, function(){}, null, {Encapsulate: testCase.input});
					});
				});
			});
		});
	});

	suite('Resulting class constructor', function(){
		test('Cloning of a constructor function', function(){
			var constructorFn = function(){};
			var Parent = function(){};
			var classConstrucor = function(){};

			var result;
			assert.doesNotThrow(function(){
				result = ClassBuilder(constructorFn, Parent, classConstrucor, {});
			});

			assert.notEqual(result, constructorFn, 'Resulting constructor function should not be equal to the input constructor function to avoid data sharing.');
			assert.equal(result.prototype.constructor.__parent, Parent.prototype, 'Reference to the prototype of a parent class is lost');
			assert.equal(result.prototype.__constructor, classConstrucor, 'Class constructor function should be saved and used as constructor for a new class instead of a parent\'s constructor function');
			assert.instanceOf(result.prototype, Parent, 'New class prototype should be an instance of Parent class to save the inheritance chain');
			assert.isObject(result.prototype.__defaults, '"__defaults" should be created in scope of class constructor to store there the default values of own variables');
		});

		test('properties for a new class', function() {
			var properties = {
				number: 1,
				string: ':)',
				bool: true,
				nullValue: null,
				array: [0,1],
				nestedObj: {
					innerObj: {
						v: 11
					},
					prop: 4
				},
				fn: function() {return this.number;}
			};

			var result;
			assert.doesNotThrow(function(){
				result = ClassBuilder(function(){}, function(){}, properties);
			});

			var ref = result.prototype.constructor.prototype;
			assert.equal(ref.__defaults.number, properties.number, 'Simple Number was incorrectly copied');
			assert.equal(ref.__defaults.string, properties.string, 'Simple String was incorrectly copied');
			assert.equal(ref.__defaults.bool, properties.bool, 'Simple boolean was incorrectly copied');
			assert.isNull(ref.__defaults.nullValue, 'Null type was not copied');

			assert.isArray(ref.__defaults.array, 'Array type was not copied');
			assert.isTrue(ref.__defaults.array[0] === properties.array[0] && ref.__defaults.array[1] === properties.array[1], 'Array items was incorrectly copied');

			assert.isObject(ref.__defaults.nestedObj, 'Object type was not saved');
			assert.notEqual(ref.__defaults.nestedObj, properties.nestedObj, 'Object from a properties should be shared');
			assert.isObject(ref.__defaults.nestedObj.innerObj, 'Inner object was not saved');
			assert.notEqual(ref.__defaults.nestedObj.innerObj, properties.nestedObj.innerObj, 'Inner nested object from a properties should be shared');
			assert.equal(ref.__defaults.nestedObj.innerObj.v, properties.nestedObj.innerObj.v, 'Value of most inner object was not copied');
			assert.equal(ref.__defaults.nestedObj.prop, properties.nestedObj.prop, 'Object properties was incorrectly copied');

			assert.isFunction(ref.fn, 'All functions should be saved in prototype for desired reuse');
			assert.equal(ref.fn, properties.fn, 'Functions should be shared');
		});

		suite('Encapsulate', function(){
			var fns = {
				method: function(){},
				method2: function(){}
			};

			[
				{
					title: '"constructor", "__constructor" and "__parent" should be ignored',
					input: [null, {
						constructor: function(){},
						__constructor: function(){},
						__parent: {},
						p0: 'p0'
					}],
					expected: {
						properties: {
							p0: 'p0'
						},
						methods: {}
					}
				},
				{
					title: 'one simple object',
					input: [null, {
						Encapsulate: {
							prop: 'prop',
							method: fns.method
						},
						p0: 'p0',
						method2: fns.method2
					}],
					expected: {
						properties: {
							p0: 'p0',
							prop: 'prop'
						},
						methods: {
							method: fns.method,
							method2: fns.method2
						}
					}
				},
				{
					title: 'two simple objects',
					input: [null, {
						Encapsulate: [
							{
								prop: 'prop',
								method: fns.method
							},
							{
								prop2: 'PROP'
							}
						],
						p0: 'p0',
						method2: fns.method2
					}],
					expected: {
						properties: {
							p0: 'p0',
							prop: 'prop',
							prop2: 'PROP'
						},
						methods: {
							method: fns.method,
							method2: fns.method2
						}
					}
				},
				{
					title: 'two simple objects with different properties of inner object',
					input: [null, {
						Encapsulate: [
							{
								prop: 'prop',
								obj: {
									prp: 'prp'
								},
								method: fns.method
							},
							{
								prop2: 'PROP',
								obj: {
									prp2: 'prp2'
								},
							}
						],
						p0: 'p0',
						obj: {
							p1: 'p1'
						}
					}],
					expected: {
						properties: {
							p0: 'p0',
							prop: 'prop',
							prop2: 'PROP',
							obj: {
								p1: 'p1',
								prp: 'prp',
								prp2: 'prp2'
							}
						},
						methods: {
							method: fns.method
						}
					}
				},
				{
					title: 'one class created by ClassBuilder',
					input: [null, {
						Encapsulate: ClassBuilder(function(){}, null, {
							prop: 'prop',
							method: fns.method
						}),
						p0: 'p0'
					}],
					expected: {
						properties: {
							p0: 'p0',
							prop: 'prop'
						},
						methods: {
							method: fns.method
						}
					}
				}
			].forEach(function(testCase){
				test(testCase.title, function(){
					// Add instance builder function and parent function.
					// Parent function is added in order to not interpret any input cases as parent class
					testCase.input.unshift(function(){}, function(){});

					var result;
					assert.doesNotThrow(function(){
						result = ClassBuilder.apply(null, testCase.input);
					});

					var ref = result.prototype;
					assert.deepEqual(ref.__defaults, testCase.expected.properties, 'Properties were incorrectly encapsulated');

					for (var method in testCase.expected.methods) {
						assert.isFunction(ref[method], method + ' was not encapsulated');
						assert.equal(ref[method], testCase.expected.methods[method], method + ' was incorrectly encapsulated');
					};
				});
			});
		});
	});

	test('Inheritance chain', function(){
		var GrandParent;
		var Parent;
		var Child;

		var result;
		assert.doesNotThrow(function(){
			GrandParent = ClassBuilder(function(){}, function(){}, {});
			Parent = ClassBuilder(function(){}, GrandParent, function(){}, {});
			Child = ClassBuilder(function(){}, Parent, function(){}, {});

			result = new Child();
		});

		assert.instanceOf(result, Child, 'Resulting instance should be an instance of Child class');
		assert.instanceOf(result, Parent, 'Resulting instance should be an instance of Parent class, because Child class is inherited from Parent class');
		assert.instanceOf(result, GrandParent, 'Resulting instance should be an instance of GrandParent class, because Parent class is inherited from GrandParent class and because Child class is inherited from Parent class');
	});
});
