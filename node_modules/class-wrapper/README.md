# {class}

Set of wrappers for easier definition of different kind of classes. Currently there are three kinds of wrappers:

* `ClassBuilder` - the main wrapper that realize the inheritance and data encapsulation. It requires a function that defines how the instances will be created. It returns the clone of defined instance builder function with special features and properties.
* `Class` - it has predefined instance builder function for `ClassBuilder`, that calls all parent's constructors before calling the constructor of a new class
* `SingletonClass` - it has predefined instance builder function for `ClassBuilder`, that by any `new` always returns the same instance. The first instance will be created in the same way as `Class`

Each wrapper accepts:
* the parent class from which a new class is going to be derived
* constructor function for a new class
* object of properties and methods for a new class

Defined class properties are treated as default values for a new instance and they are isolated between instances. For example if some class has an object in properties then each instance will have its own copy of that default object. Only methods are shared.


## Requirements
* [Object.create](http://kangax.github.io/compat-table/es5/#test-Object.create)
* [Function.prototype.bind](http://caniuse.com/#feat=es5)
* [Array.prototype.forEach](http://caniuse.com/#feat=es5)

If this library is planned to be used in some legacy environment then please add required plyfills. Here is a good resource: https://github.com/es-shims/es5-shim


## Installation
Via [NPM (Node Package Manager)](https://github.com/npm/npm)
```
$ npm install class-wrapper --save
```

Available library files:

1. `dest/class-wrapper.js` - not minified library package
1. `dest/class-wrapper.min.js` - minified library package

The destination library files are surrounded with the [universal module definition](https://github.com/umdjs/umd/). So it can be loaded
- as a module for NodeJS
- as an AMD module
- or will be stored into the global variable under the name `"class-wapper"`


## Simple usage examples

```js
// Define a Figure class:
var Figure = Class(function() {
	console.log('Figure::initialize()');
}, {
	// abstract function for a calculating a suqare of a figure
	calcArea: function() {}
});

// Define Rectangle class derived from a Figure class:
var Rectangle = Class(Figure, function(width, height) {
	console.log('Rectangle::initialize()');

	this._width = width;
	this._height = height;
}, {
	_width: 0,
	_height: 0,

	calcArea: function() {
		return this._width * this._height;
	}
});

// Define Square class as a special case of Rectangle:
var Square = Class(Rectangle, function(length) {
	console.log('Square::initialize()');

	this._height = length;
});


// Create a rectangle with width 2 and height 4
var someRect = new Rectangle(2, 4);
// the following lines will be logged in console:
//	Figure::initialize()
//	Rectangle::initialize()

console.log(someRect.calcArea());		// the square is: 8


// Create a square with an edge length 5
var someSqrt = new Square(5);
// the following lines will be logged in console:
//	Figure::initialize()
//	Rectangle::initialize()
//	Square::initialize()

console.log(someSqrt.calcArea());		// the square is: 25
```


## Links
* [wiki](https://github.com/valerii-zinchenko/class-wrapper/wiki)
* [API](http://valerii-zinchenko.github.io/class-wrapper/doc/index.html)
* [Code coverage](http://valerii-zinchenko.github.io/class-wrapper/coverage/index.html)
* [Run unit tests](http://valerii-zinchenko.github.io/class-wrapper/test/index.html)
