/**
 * Base class for tying components together. Maintains a list of its own components and if it needs to be updated in the scene.
 * 
 * @class Entity
 */
class Entity{
    /**
     * Creates an instance of Entity. Optionally with a predifined list of components.
     * 
     * @param {any} [_components={}] 
     * @memberof Entity
     */
    constructor(_components = {}) {
        this.id = uuid();
        this.components = _components;
        this.needsUpdate = true;
    }

    /**
     * Attach a component with a unique tag.
     * 
     * @param {Object} component The component to be added to this entity.
     * @param {string} type The unique identifier for this component type.
     * @memberof Entity
     */
    attach(component, type){
        this.components[type] = component;
        this.needsUpdate = true;
    }

    /**
     * Removes a type of component from this entity.
     * 
     * @param {string} type The unique identifier of the component type.
     * @memberof Entity
     */
    detach(type){
        this.components[type] = null;
        this.needsUpdate = true;
    }
}

/**
 * Convienience function for the creation of unique identifiers. See: {@link https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript}
 * 
 * @returns A universally unique identifier
 */
function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}