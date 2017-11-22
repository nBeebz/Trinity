//=require Entity.js
//=require PhysicsComponent.js
//=require GraphicsComponent.js
//=require AudioComponent.js

/**
 * Helper class for easy construction of basic entities.
 * 
 * @class EntityFactory
 */
class EntityFactory{
    constructor(){}

    /**
     * Creates a basic box object with a material and physics.
     * 
     * @param {Object} [size=new THREE.Vector3(1, 1, 1)] A vector3 representing the size of the box.
     * @param {Object} [position=new THREE.Vector3(0, 0, 0)] A vector3 represeting the position of the box.
     * @param {number} [mass=0] The mass of the box
     * @param {any} [rotation=new THREE.Quaternion(0, 0, 0, 1)] The rotation of the box in quaternion form.
     * @param {number} [colour=0xFFFFFF] The colour to give the material for this box.
     * @returns {Entity} A newly created entity.
     * @memberof EntityFactory
     */
    makeBox(
        size = new THREE.Vector3(1, 1, 1), 
        position = new THREE.Vector3(0, 0, 0), 
        mass = 0, 
        rotation = new THREE.Quaternion(0, 0, 0, 1), 
        colour = 0xFFFFFF)
    {
        var components = {};
        
        // Physics
        var boxShape = new Ammo.btBoxShape( new Ammo.btVector3( size.x * 0.5, size.y * 0.5, size.z * 0.5 ) );
        components[TAG_PHYSICS] = new PhysicsComponent(boxShape, position, mass, rotation);
        
        // Graphics
        var boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1);
        var material = new THREE.MeshPhongMaterial({color : colour});
        components[TAG_GRAPHICS] = new GraphicsComponent(boxGeometry, material);
        
        
        return new Entity(components);
    }

    /**
     * Creates a simple looping music player.
     * 
     * @param {string[]} path The list of sound files to attempt to use.
     * @returns {AudioComponent} The created audio component.
     * @memberof EntityFactory
     */
    makeMusicPlayer(path){
        var options = {
            loop: true
        };
        return new AudioComponent(path, options);
    }

    /**
     * Creates a simple looping music player with a position in 3d space.
     * 
     * @param {any} path The list of sound files to attempt to use.
     * @param {any} position The position this sound should play from.
     * @returns {AudioComponent} The created audio component.
     * @memberof EntityFactory
     */
    makeMusicPlayerWithPosition(path, position){
        var options = {
            loop: true
        };
        var component = new AudioComponent(path, options);
        component.enablePositionalAudio(position);
        return component;
    }
}

