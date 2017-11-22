//=require trinity/Scene.js
//=require trinity/EntityFactory.js

var factory = new EntityFactory();

function MakeWallScene(){
    var scene = new Scene("wall");
    var size = new THREE.Vector3();
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();

    var audio;

    // Ground
    position.set( 0, -0.5, 0 );
    quaternion.set( 0, 0, 0, 1 );
    size.set(40, 1, 40);
    
    var ground = factory.makeBox( size, position, 0, quaternion );
    scene.add(ground);
    GraphicsComponent.OnLoadTexture( "textures/grid.png", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 40, 40 );
        ground.components[TAG_GRAPHICS].applyTexture(texture);
    } );

    // Wall
    var brickMass = 0.5;
    var brickLength = 1.2;
    var brickDepth = 0.6;
    var brickHeight = brickLength * 0.5;
    var numBricksLength = 6;
    var numBricksHeight = 8;
    var z0 = - numBricksLength * brickLength * 0.5;

    position.set( 0, brickHeight * 0.5, z0 );
    quaternion.set( 0, 0, 0, 1 );
 
    for ( var j = 0; j < numBricksHeight; j ++ ) {
        var oddRow = ( j % 2 ) == 1;
        position.z = z0;
        if ( oddRow ) {
            position.z -= 0.25 * brickLength;
        }
        var nRow = oddRow? numBricksLength + 1 : numBricksLength;
        for ( var i = 0; i < nRow; i ++ ) {
            var brickLengthCurrent = brickLength;
            var brickMassCurrent = brickMass;
            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }

    
            size.set(brickDepth, brickHeight, brickLengthCurrent);
            var brick = factory.makeBox( size, position, brickMassCurrent, quaternion, randomColor() );
            if(j == numBricksHeight-1 && i == nRow-1){
                audio = factory.makeMusicPlayerWithPosition(["sound/bgm/yellowcalx.mp3"], brick.components[TAG_GRAPHICS].mesh.position);
                brick.attach(audio, TAG_AUDIO);
            }
            scene.add( brick );
            
            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
                position.z += 0.75 * brickLength;
            }
            else {
                position.z += brickLength;
            }

            
        }
        position.y += brickHeight;
    }
    var mic = new AudioComponent();
    mic.enableMicrophone(scene.camera.position);
    var components = {};
    components[TAG_AUDIO] = mic;
    var player = new Entity(components);
    scene.add(player);
    
    scene.addAmbientLight( 0x404040 );
    scene.addDirectionalLight( -10, 10, 5 );
    scene.camera.position.set( -12, 7, 4 );

    scene.enableOrbitalControl(new THREE.Vector3(0, 2, 0));

    var cameraControl = {
        "GP_AXIS_RIGHT_X" : function(val){
            scene.camera.position.z += val;
        },
        "GP_AXIS_RIGHT_Y" : function(val){
            scene.camera.position.y -= val;
        },
        "GP_AXIS_LEFT_X" : function(val){
            scene.input.cameraControl.target.z += val;
        },
        "GP_AXIS_LEFT_Y" : function(val){
            scene.input.cameraControl.target.y -= val;
        },
        "p" : function(){
            audio.toggle();
        }
    }
    scene.input.bindControls(cameraControl);

    return scene;
}

function MakeModelScene(){
    var scene = new Scene("model");
    GraphicsComponent.OnLoadModel("female02", function(object){
        var woman = new Entity();
        woman.attach(new GraphicsComponent(object, false), TAG_GRAPHICS);
        scene.add(woman);
    });
    scene.camera.position.set(0, 175, 500);
    scene.addDirectionalLight(-100, -50, 100, 0xC0C090);
    scene.addAmbientLight();
    scene.enableOrbitalControl();

    return scene;
}

function MakeJengaScene(domElement){
    var scene = new Scene("jenga");
    
    var block_length = 6, block_height = 1, block_width = 1.5, block_offset = 2,
        size = new THREE.Vector3( block_length, block_height, block_width );
        
    var position = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
        
    var i, j, rows = 16,
        block;

    var blocks = {};
    var selected_block = null;
    var offset = new THREE.Vector3();
    var mouse_position = new THREE.Vector3();
    var intersect_plane;
    var _v3 = new THREE.Vector3();
    
    var click = new AudioComponent(["sound/sfx/minecraft_click.mp3"]);
    var entity = new Entity();
    entity.attach(click, TAG_AUDIO);
    scene.add(entity);
    
    
    scene.addAmbientLight(0x404040);
    scene.addDirectionalLight(20, 30, -5);
    scene.camera.position.set(25, 20, 25);
    scene.camera.lookAt(new THREE.Vector3(0,7,0));
    camera = scene.camera;
    initEventHandling(domElement);

    for ( i = 0; i < rows; i++ ) {
        for ( j = 0; j < 3; j++ ) {
            position.set(0,0,0);
            rotation.set(0,0,0,1);
            position.y = (block_height / 2) + block_height * i;
            if ( i % 2 === 0 ) {
                rotation.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 2.01); // #TODO: There's a bug somewhere when this is to close to 2
                position.x = block_offset * j - ( block_offset * 3 / 2 - block_offset / 2 );
            } else {
                position.z = block_offset * j - ( block_offset * 3 / 2 - block_offset / 2 );
            }
            block = factory.makeBox(size, position, 1, rotation, randomColor());
            block.components[TAG_GRAPHICS].mesh.userData = block.id;
            blocks[block.id] = block.components[TAG_GRAPHICS].mesh;
            scene.add(block);
        }
    }

    intersect_plane = new GraphicsComponent(
        new THREE.PlaneGeometry( 150, 150 ),
        new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
    );
    intersect_plane.mesh.rotation.x = Math.PI / -2;

    var plane = new Entity();
    plane.attach(intersect_plane, TAG_GRAPHICS);
    scene.add(plane);

    // Ground
    position.set( 0, -0.5, 0 );
    rotation.set( 0, 0, 0, 1 );
    size.set(40, 1, 40);
    
    var ground = factory.makeBox( size, position, 0, rotation );
    GraphicsComponent.OnLoadTexture( "textures/grid.png", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 40, 40 );
        ground.components[TAG_GRAPHICS].applyTexture(texture);
    } );
    scene.add(ground);

    var parentUpdate = scene.update.bind(scene);

    scene.update = function(deltaTime){
        if ( selected_block !== null ) {
            var body = scene.components[TAG_PHYSICS][selected_block].body;
            _v3.copy( mouse_position ).add( offset ).sub( scene.components[TAG_GRAPHICS][selected_block].mesh.position ).multiplyScalar( 5 );
            _v3.y = 0;
            body.setLinearVelocity( new Ammo.btVector3(_v3.x, _v3.y, _v3.z) );
            
            // Reactivate all of the blocks
            _v3.set( 0, 0, 0 );
            var keys = Object.keys(blocks);
            for ( var i in keys) {
                scene.components[TAG_PHYSICS][keys[i]].body.applyCentralImpulse( new Ammo.btVector3(_v3.x, _v3.y, _v3.z) );
            }
        }
        parentUpdate(deltaTime);
    };

    function initEventHandling(domElement) {
        var _vector = new THREE.Vector3(),
            handleMouseDown, handleMouseMove, handleMouseUp;
        
        handleMouseDown = function( evt ) {
            var ray, intersections;
            
            _vector.set(
                ( evt.clientX / window.innerWidth ) * 2 - 1,
                -( (evt.clientY-60) / window.innerHeight ) * 2 + 1,
                1
            );
            _vector.unproject( camera );
            
            ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
            intersections = ray.intersectObjects( Object.values(blocks) );
            if ( intersections.length > 0 ) {
                click.play();
                selected_block = intersections[0].object.userData;
                var body = scene.components[TAG_PHYSICS][selected_block].body;
                
                _vector.set( 0, 0, 0 );
                var vec = new Ammo.btVector3(_vector.x, _vector.y, _vector.z );
                body.setAngularFactor( vec );
                body.setAngularVelocity( vec );
                body.setLinearFactor( vec );
                body.setLinearVelocity( vec );
                mouse_position.copy( intersections[0].point );
                offset.subVectors( scene.components[TAG_GRAPHICS][selected_block].mesh.position, mouse_position );
                
                intersect_plane.mesh.position.y = mouse_position.y;
            }
        };
        
        handleMouseMove = function( evt ) {
            
            var ray, intersection,
                i, scalar;
            
            if ( selected_block !== null ) {
                
                _vector.set(
                    ( evt.clientX / window.innerWidth ) * 2 - 1,
                    -( (evt.clientY-60) / window.innerHeight ) * 2 + 1,
                    1
                );
                _vector.unproject( camera );
                
                ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
                intersection = ray.intersectObject( intersect_plane.mesh );
                mouse_position.copy( intersection[0].point );
            }
            
        };
        
        handleMouseUp = function( evt ) {
            
            if ( selected_block !== null ) {
                _vector.set( 1, 1, 1 );
                var vec = new Ammo.btVector3(_vector.x, _vector.y, _vector.z);
                var body = scene.components[TAG_PHYSICS][selected_block].body;
                body.setAngularFactor( vec );
                body.setLinearFactor( vec );
    
                selected_block = null;
            }
            
        };
        
        domElement.addEventListener( 'mousedown', handleMouseDown );
        domElement.addEventListener( 'mousemove', handleMouseMove );
        domElement.addEventListener( 'mouseup', handleMouseUp );
    }

    return scene;
}

function randomColor() {
    return Math.floor( Math.random() * ( 1 << 24 ) );
}
