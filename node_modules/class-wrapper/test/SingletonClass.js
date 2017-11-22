/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/


suite('Instance from a SingletonClass', function() {
	test('creating an instance without any specified constructor', function(){
		assert.doesNotThrow(function(){
			new (SingletonClass(null, {}));
		});
	});

	test('calling of specific constructor', function() {
		var spy = sinon.spy();
		assert.doesNotThrow(function() {
			new (SingletonClass(spy, {}))();
		});

		assert.isTrue(spy.calledOnce, 'constructor is treated as a specific class constructor and it should be called by creating new class instance');
	});

	test('SingletonClass class should always produce the same instance', function() {
		var constructorFn = sinon.spy();
		var inst1;
		var inst2;

		assert.doesNotThrow(function(){
			var Obj = SingletonClass(constructorFn, {});

			inst1 = new Obj();
			inst2 = new Obj();
		});

		assert.equal(inst1, inst2, 'SingletonClass should always produce the same instance');
		assert.isTrue(constructorFn.calledOnce, 'ScingletonClass should call constructor only once, then it should return already created instance');
	});

	test('Calling of parent constructor', function() {
		var value = 11,
			k = 4;

		var Parent = new SingletonClass(function() {
			this.value = value;
		}, {});
		var Child = new SingletonClass(Parent, function() {
			this.value *= k;
		}, {});

		assert.equal((new Child()).value, value*k);
	});

	test('Iheritance', function(){
		var GrandParentClass;
		var ParentClass;
		var ChildClass;

		var result;
		assert.doesNotThrow(function(){
			GrandParentClass = SingletonClass(null, {});
			ParentClass = Class(GrandParentClass, null, {});
			ChildClass = Class(ParentClass, null, {});

			result = new ChildClass();
		});

		assert.instanceOf(result, ChildClass, 'Resulting instance should be an instance of ChildClass');
		assert.instanceOf(result, ParentClass, 'Resulting instance should be an instance of ParentClass, because ParentClass is a parent class of the ChildClass');
		assert.instanceOf(result, GrandParentClass, 'Resulting instance should be an instance of GrandParentClass, because GrandParentClass is a parent class of ParentClass and ParentClass is a parent class of ChildClass');
	});

	test('Instance independance', function(){
		var parentInst;
		var childInst;

		assert.doesNotThrow(function(){
			var Parent = SingletonClass(null, {});
			var Child = SingletonClass(Parent, null, {});

			parentInst = new Parent();
			childInst = new Child();
		});

		assert.notEqual(childInst, parentInst, 'Instance from the parent class should not be shared by creating an instance from a child class');
	});
});
