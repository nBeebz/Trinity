//=require GraphicsComponent.js
//=require PhysicsComponent.js
//=require AudioComponent.js
//=require InputManager.js

/**
 * This class handles the management and updating of the entities and components attached to the scene.
 * 
 * @class Scene
 */
class Scene{
    /**
     * Creates an instance of Scene.
     * @param {string} [_id="default"] The unique identifier to be used for this Scene. The user should usually provide one.
     * @memberof Scene
     */
    constructor(_id = "default"){
        // THREE.js rendering setup
        
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xbfd1e5 );
        this.input = new InputManager();

        // ammo.js physics setup
        var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        var broadphase = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        var softBodySolver = new Ammo.btDefaultSoftBodySolver();
        var gravityConstant = -9.8;

        this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
        this.physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );

        // The entities attached to the scene. Order determines which entities get updated first.
        this.entities = [];
        // The components attached to the scene
        this.components = {};
        
        // The list of component tags this scene is managing. Order determines the update order
        this.tagList = [];
        this.addComponentType(TAG_PHYSICS);
        this.addComponentType(TAG_GRAPHICS);
        this.addComponentType(TAG_AUDIO);
        
        
        this.transformAux1 = new Ammo.btTransform();

        this.id = _id;
    }
   
    /**
     * Adds a new component type for this scene to manage. Components that are added will be looped through and thier update() method called in the game loop.
     * 
     * @param {any} tag The unique tag name for this component type
     * @memberof Scene
     */
    addComponentType(tag){
        if(!this.tagList.includes(tag)){
            this.tagList.push(tag);
            this.components[tag] = {};
        }else{
            console.error("Component type " + tag + " already exists" );
        }
    }

    /**
     * Adds an entity to the scene
     * 
     * @param {Scene} entity The entity whose components will be updated when this scene is active.
     * @memberof Scene
     */
    add( entity ){
        if(entity instanceof Entity){
            this.entities.push(entity);
            for(var tag in entity.components){
                if(this.tagList.includes(tag)){
                    this.components[tag][entity.id] = entity.components[tag];

                    // Add graphics to the scene
                    if(tag == TAG_GRAPHICS){
                        this.scene.add(entity.components[tag].mesh);
                    }

                    // Add physics objects to the world
                    if(tag == TAG_PHYSICS){
                        this.physicsWorld.addRigidBody(entity.components[tag].body);
                    }
                }
            }
            entity.needsUpdate = false;
        }else{
            console.error("Object is not of type Entity and cannot be added to the scene.");
            console.log(entity);
        }
    }

    /**
     * Updates an entity whose state has changed
     * 
     * @param {any} entity The entity to update
     * @memberof Scene
     */
    updateEntity(entity){
        if(!entities.includes(entity)){
            this.add(entity);
            return;
        }
        for(var tag in entity.components){
            if(this.tagList.includes(tag)){
                this.components[tag][entity.id] = entity.components[tag];
            }
        }

        entity.needsUpdate = false;
    }

/**
 * Updates this scene and all of it's components.
 * 
 * @param {any} deltaTime The time since last update
 * @memberof Scene
 */
update(deltaTime){
        this.input.update();

        // Step world
        this.physicsWorld.stepSimulation( deltaTime, 10 );
        
        
        // Update entities first
        for ( var i = 0; i < this.entities.length; i++ ) {
            if(this.entities[i].needsUpdate){
                updateEntity(this.entities[i]);     
            }
        }

        // Loop through components and update
        for ( var j = 0; j < this.tagList.length; j++ ) {
            var tag = this.tagList[j];
            
            var eid;
            // Necessary coupling between physics and graphics
            if(tag == TAG_PHYSICS){
                for ( eid in this.components[tag] ) {
                    var moved = this.components[tag][eid].update( this.transformAux1 );
                    var gfx = this.components[TAG_GRAPHICS][eid];
                    if(moved && gfx !== undefined){
                        gfx.transform(this.transformAux1);
                    }
                }
            }else{
                for ( eid in this.components[tag] ) {
                    this.components[tag][eid].update();
                }
            }
        }
    }

    /**
     * Convienience method for enabled orbital-style camera controls on this scene.
     * 
     * @param {any} [target=new THREE.Vector3(0,0,0)] The target to orbit around.
     * @memberof Scene
     */
    enableOrbitalControl(target = new THREE.Vector3(0,0,0)){
        this.input.enableOrbitalControl(this.camera, target);
    }

    /**
     * Adds a directional light to the scene
     * 
     * @param {any} x The x position of the light
     * @param {any} y The y position of the light
     * @param {any} z The z position of the light
     * @param {number} [colour=0xffffff] The colour of the light
     * @memberof Scene
     */
    addDirectionalLight(x, y, z, colour = 0xffffff){
        var light = new THREE.DirectionalLight( colour, 1 );
        light.position.set( x, y, z );
        light.castShadow = true;
        
        var d = 10;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 2;
        light.shadow.camera.far = 50;
        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;
        light.shadow.bias = -0.003;
        
        this.scene.add(light);
    }

    /**
     * Adds ambient light to the scene.
     * 
     * @param {number} [colour=0xffffff] The colour of the ambient light
     * @memberof Scene
     */
    addAmbientLight(colour = 0xffffff){
        this.scene.add(new THREE.AmbientLight(colour));
    }

    /**
     * Handles any cleanup for the scene when it becomes inactive
     * 
     * @memberof Scene
     */
    dispose(){
        this.input.dispose();
    }

    /**
     * Handles any preperation for the scene when it becomes active.
     * 
     * @memberof Scene
     */
    prepare(){
        this.input.prepare();
    }
}