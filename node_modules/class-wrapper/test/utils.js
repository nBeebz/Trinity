/*
 Copyright (c) 2016-2017  Valerii Zinchenko

 Licensed under MIT (https://github.com/valerii-zinchenko/class-wrapper/blob/master/LICENSE.txt)

 All source files are available at: http://github.com/valerii-zinchenko/class-wrapper
*/


suite('utils', function() {
	suite('Object manipulations.', function() {
		var v1 = 11,
			v2 = 4,
			v3 = 19,
			v4 = 90;
		var obj1, obj2;

		setup(function() {
			obj1 = {
				value: v1,
				innObj: {
					innValue: v2
				},
				innObj2: {
					innInnObj: {
						innInnVal: v4
					}
				},
				empty: null,
				array: [v3]
			};
			obj2 = {
				value: v3,
				innObj2: {
					innInnObj: {},
					innInnV: v1
				}
			};
		});
		teardown(function() {
			obj1 = null;
			obj2 = null;
		});

		test('deepExtend()', function() {
			utils.deepExtend(obj2, obj1);

			assert.equal(obj2.value, v3);
			assert.equal(obj2.innObj.innValue, v2);
			assert.notEqual(obj2.innObj, obj1.innObj);
			assert.isObject(obj2.innObj2.innInnObj);
			assert.equal(obj2.innObj2.innInnV, v1);
			assert.equal(obj2.innObj2.innInnObj.innInnVal, v4);
			assert.property(obj2, 'empty', 'Extended object was not extended with property "empty"');
			assert.property(obj2, 'array', 'Extended object was not extended with property "array"');
			assert.equal(obj2.array[0], v3);
			assert.notEqual(obj2.array, obj1.array, 'Array should be copied into the extended object');
		});

		test('deepCopy()', function() {
			utils.deepCopy(obj2, obj1);

			assert.equal(obj2.value, v1);
			assert.equal(obj2.innObj.innValue, v2);
			assert.notEqual(obj2.innObj, obj1.innObj);
			assert.isObject(obj2.innObj2.innInnObj);
			assert.equal(obj2.innObj2.innInnObj.innInnVal, v4);
		});
	});
});
