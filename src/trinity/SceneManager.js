//=require Scene.js

/**
 * This class handles the management of scene objects. Can only be instantiated once.
 * 
 * @class SceneManager
 */
class SceneManager{
    /**
     * Creates an instance of SceneManager or returns it's instance if already created.
     * @param {any} startingScene The scene to start with this SceneManager.
     * @memberof SceneManager
     */
    constructor(height = window.innerHeight, width = window.innerWidth, startingScene = null){
        if(SceneManager.Instance){
            return SceneManager.Instance;
        }

        this.scenes = {};
        if(startingScene instanceof Scene){
            this.changeScene(startingScene);
        }

        this.screenWidth = width;
        this.screenHeight = height;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.screenWidth, this.screenHeight );
        this.renderer.shadowMap.enabled = true;        

        document.body.appendChild( this.renderer.domElement );  
        window.addEventListener( 'resize', this.onWindowResize, false );

        SceneManager.Instance = this;
    }
    
    /**
     * The callback to handle the browser window resizing
     * 
     * @memberof SceneManager
     */
    onWindowResize() {
        for(var scene in this.scenes){
            scene.camera.aspect = this.screenWidth / this.screenHeight;
            scene.camera.updateProjectionMatrix();
        }
        this.renderer.setSize( this.screenWidth, this.screenHeight );
    }

    /**
     * Adds to the list of scenes to be managed.
     * 
     * @param {any} scene The scene to be added
     * @memberof SceneManager
     */
    addScene(scene){
        this.scenes[scene.id] = scene;
        if(this.currentScene == undefined){
            this.changeScene(scene);
        }
    }

    /**
     * Removes from the list of scenes to be managed.
     * 
     * @param {any} scene The scene to be removed
     * @memberof SceneManager
     */
    removeScene(scene){
        if(this.currentScene == scene){
            this.currentScene = new Scene();
        }
        delete this.scenes[scene.id];
    }

    /**
     * Change scenes to the provided one.
     * 
     * @param {any} scene The scene to change to.
     * @memberof SceneManager
     */
    changeScene(scene){
        var id = scene.id;
        if(!(id in this.scenes)){
            this.addScene(scene);
        }
        if(this.currentScene != undefined){
            this.currentScene.dispose();
        }
        this.scenes[id].prepare();
        this.currentScene = this.scenes[id];
    }

    /**
     * Update the current scene and then draw using the renderer.
     * 
     * @param {number} deltaTime The time since the last update.
     * @memberof SceneManager
     */
    draw(deltaTime){
        this.currentScene.update(deltaTime);
        this.renderer.render(this.currentScene.scene, this.currentScene.camera);
    }

}

/**
 * Variable used to enforce the singleton pattern for SceneManager
 * @static
 */
SceneManager.Instance = false;