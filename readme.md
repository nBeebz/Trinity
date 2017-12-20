# Trinity Engine

The Trinity engine is a component-based game engine made for maximum flexibility.

## Installation

Node.js is required to build this project: https://nodejs.org/en/

```
// clone the repo
git clone github.com/nbeebz/Trinity.git

// install dependencies
npm install

// build and launch using gulp
gulp
```

## Creating your first game

```
// Include the engine in your project with a directive (top of the js file)
//=require trinity/Trinity.js

// Create a new Trinity object
var myGame = new Trinity();

// Create a scene to display
var scene = new Scene();
var factory = new EntityFactory();
scene.add(factory.makeBox());

// Add some controls
scene.input.bindControls({
    "1": function(){console.log("You pressed the number 1!")}
});

// Add the scene to your game
myGame.add(scene)
```

See the /docs subdirectory for full documentation of all the features of the Trinity engine.