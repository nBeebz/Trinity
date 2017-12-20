//=require lib/ammo.js

const TAG_PHYSICS = 'physics';

/**
 * This component encapsulates a physical object in 3d space.
 * 
 * @class PhysicsComponent
 */
class PhysicsComponent{
    /**
     * Creates an instance of PhysicsComponent.
     * @param {Object} shape The ammo.js shape of this component
     * @param {Object} position The position of the component.
     * @param {number} mass The mass of the component.
     * @param {Object} rotation The rotation of the component in quaternion form.
     * @memberof PhysicsComponent
     */
    constructor(shape = new Ammo.btBoxShape(new Ammo.btVector3(1,1,1)), position = new Ammo.btVector3(0,0,0), mass = 0, rotation = new Ammo.btVector3(0,0,0)){
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
        transform.setRotation( new Ammo.btQuaternion( rotation.x, rotation.y, rotation.z, rotation.w ) );
        var motionState = new Ammo.btDefaultMotionState( transform );
        
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        this.body = new Ammo.btRigidBody( rbInfo );

        if(mass > 0){
            this.body.setActivationState( 4 );
        }
    }

    /**
     * Updates this component after the physics world as been stepped.
     * 
     * @param {any} transform The transform information for this component. Will be saved to this object if it has a motion state.
     * @returns {boolean} Whether or not this component has a motion state on this frame.
     * @memberof PhysicsComponent
     */
    update( transform ){
        var ms = this.body.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( transform );
            return true;
        }
        return false;
    }

    /**
     * TODO: Move this object without using ammo.js native vectors.
     * 
     * @param {any} position 
     * @memberof PhysicsComponent
     */
    moveTo(position){

    }

}
