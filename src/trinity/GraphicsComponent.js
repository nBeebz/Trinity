//=require lib/THREE/three.min.js 
//=require lib/THREE/LoaderSupport.js
//=require lib/THREE/OBJLoader2.js
//=require lib/THREE/MTLLoader.js

var TAG_GRAPHICS = 'graphics';

/**
 * This class encapsulates a graphical object in 3d space.
 * 
 * @class GraphicsComponent
 */
class GraphicsComponent{
    /**
     * Creates an instance of GraphicsComponent.
     * @param {Object} geometry The shape of this graphical object. Usually a THREE.js shape.
     * @param {(Object|boolean)} material The material to use for this graphical object. Usually a THREE.js texture. You may also pass FALSE to indicate the user will handle applying the material to the object.
     * @memberof GraphicsComponent
     */
    constructor(geometry, material){
        if(!material){
            this.mesh = geometry;
        }else{
            this.mesh = new THREE.Mesh(geometry, material);
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    /**
     * Applies this texture to the graphical component
     * 
     * @param {Object} texture The THREE.js texture to apply
     * @memberof GraphicsComponent
     */
    applyTexture(texture){
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
    }

    /**
     * Will be called every frame.
     * 
     * @memberof GraphicsComponent
     */
    update(){}

    /**
     * Transform this graphical component given the ammo.js transform object.
     * 
     * @param {Object} transform The ammo.js transform object to apply.
     * @memberof GraphicsComponent
     */
    transform( transform ){
        var p, q;
        p = transform.getOrigin();
        q = transform.getRotation();
        this.mesh.position.set( p.x(), p.y(), p.z() );
        this.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
    }
}

/** 
 * The loaders available to load models and textures.
 * @static  
 */
GraphicsComponent.Loaders = {
    textureLoader : new THREE.TextureLoader(),
    objLoader : new THREE.OBJLoader2()
};

/**
 * Convienience method to load a texture
 * 
 * @param {string} textPath The path to the texture to load
 * @param {Object} callback The callback function to fire when this texture is loaded
 * @static
 */
GraphicsComponent.OnLoadTexture = function(textPath, callback){
    GraphicsComponent.Loaders.textureLoader.load(textPath, callback);
};

/**
 * Convienience method to load a model
 * 
 * @param {string} textPath The name of the model to load
 * @param {Object} callback The callback function to fire when this model is loaded
 * @static
 */
GraphicsComponent.OnLoadModel = function(modelName, callback){
    var basePath = "models/" + modelName + "/";
    var mtlPath = basePath + modelName + ".mtl";
    var modelPath = basePath + modelName + ".obj";

    var callbackOnLoad = function ( event ) {
        console.log( 'Loading complete: ' + event.detail.modelName );
        callback( event.detail.loaderRootNode );
    };
    var onLoadMtl = function ( materials ) {
        GraphicsComponent.Loaders.objLoader.setModelName( modelName );
        GraphicsComponent.Loaders.objLoader.setMaterials( materials );
        GraphicsComponent.Loaders.objLoader.setUseIndices( true );
        GraphicsComponent.Loaders.objLoader.setDisregardNormals( false );
        GraphicsComponent.Loaders.objLoader.load( modelPath, callbackOnLoad, null, null, null, true );
    };
    GraphicsComponent.Loaders.objLoader.loadMtl( mtlPath, modelName + ".mtl", null, onLoadMtl );
};