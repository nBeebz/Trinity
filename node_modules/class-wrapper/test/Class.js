/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/


suite('Instance from a Class', function() {
	test('creating an instance without any specified constructor', function(){
		assert.doesNotThrow(function(){
			new (Class(null, {}));
		});
	});

	test('calling of specific constructor', function() {
		var spy = sinon.spy();
		assert.doesNotThrow(function() {
			new (Class(spy, {}))();
		});

		assert.isTrue(spy.calledOnce, 'constructor is treated as a specific class constructor and it should be called by creating new class instance');
	});

	test('Class should always produce a new instance', function() {
		var inst1;
		var inst2;

		assert.doesNotThrow(function(){
			var Obj = Class(null, {});

			inst1 = new Obj();
			inst2 = new Obj();
		});

		assert.notEqual(inst1, inst2, 'Class should always produce a new instance');
	});

	test('Cloning of properties', function() {
		var obj1;
		var obj2;

		assert.doesNotThrow(function(){
			var Obj = Class(null, {
				obj: {}
			});

			obj1 = new Obj(),
			obj2 = new Obj();
		});

		assert.notEqual(obj1.obj, obj2.obj, 'Object under property name "obj" should not be shared between instances');
	});

	test('Constructor chain', function(){
		var grandParentConstructor = sinon.spy();
		var parentConstructor = sinon.spy();
		var childConstructor = sinon.spy();
		var arg0 = 'abc';
		var arg1 = {};

		var result;
		assert.doesNotThrow(function(){
			var GrandParentClass = Class(grandParentConstructor, {});
			var ParentClass = Class(GrandParentClass, parentConstructor, {});
			var ClassWithoutSpecificConstructor = Class(ParentClass, null, {});
			var ChildClass = Class(ClassWithoutSpecificConstructor, childConstructor, {});

			result = new ChildClass(arg0, arg1);
		});

		assert.isTrue(childConstructor.calledOnce, 'Constructor of child class was not called');
		assert.isTrue(parentConstructor.calledOnce, 'Constructor of parent class was not called');
		assert.isTrue(grandParentConstructor.calledOnce, 'Constructor of grand parent class was not called');
		
		assert.isTrue(childConstructor.calledAfter(parentConstructor), 'Constructor of child and parent class were called in incorrect order');
		assert.isTrue(parentConstructor.calledAfter(grandParentConstructor), 'Constructor of parent and grand parent class were called in incorrect order');

		assert.isTrue(childConstructor.calledWith(arg0, arg1), 'Child constructucor was called with incorrect input arguments');
		assert.isTrue(parentConstructor.calledWith(arg0, arg1), 'Parent constructucor was called with incorrect input arguments');
		assert.isTrue(grandParentConstructor.calledWith(arg0, arg1), 'Grand parent constructucor was called with incorrect input arguments');
	});

	test('Iheritance', function(){
		var GrandParentClass;
		var ParentClass;
		var ChildClass;

		var result;
		assert.doesNotThrow(function(){
			GrandParentClass = Class(function(){}, {});
			ParentClass = Class(GrandParentClass, function(){}, {});
			ChildClass = Class(ParentClass, function(){}, {});

			result = new ChildClass();
		});

		assert.instanceOf(result, ChildClass, 'Resulting instance should be an instance of ChildClass');
		assert.instanceOf(result, ParentClass, 'Resulting instance should be an instance of ParentClass, because ParentClass is a parent class of the ChildClass');
		assert.instanceOf(result, GrandParentClass, 'Resulting instance should be an instance of GrandParentClass, because GrandParentClass is a parent class of ParentClass and ParentClass is a parent class of ChildClass');
	});
});
