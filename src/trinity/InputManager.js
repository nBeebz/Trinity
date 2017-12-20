//=require lib/THREE/TrackballControls.js
//=require lib/THREE/OrbitControls.js
//=require lib/THREE/PointerLockControls.js


/**
 * An instance of this class can be used to attach / detach callbacks
 * for both keyboard and gamepad input. Also includes basic camera control support.
 * 
 * @class InputManager
 */
class InputManager{

    /**
     * Function callback for keyboard presses
     * @callback InputManager~keyCallback
     * @param {Object} event The event object that was fired for this key press.
     */

    /**
     * Function callback for gamepad input
     * @callback InputManager~gamepadCallback
     * @param {number} value The value of this button or axis. Most button presses will return a value of 1, pressure sensitive buttons between 0 and 1.0, and axes between -1.0 and 1.0.
     * @param {boolean} wasDown Whether or not this button was down on the previous frame.
     */

    /**
     * Creates an instance of InputManager.
     * @memberof InputManager
     */
    constructor(){  
        
        this.keyCallbacks = {};
        this.gpBtnCallbacks = {};        
        this.gpAxisCallbacks = {};        
        this.controllers = {};
        this.prevButtons = {};
        this.mouseCallback = function(){};

        this.cameraControl = {
            update : function(){},
            dispose : function(){},
            prepare : function(){}
        };
        
        this.gamepadConnectedHandler = this.handleGamepadConnected.bind(this);
        this.gamepadDisconnectedHandler = this.handleGamepadRemoved.bind(this);
        this.mouseClickHandler = this.handleMouseClick.bind(this);
        this.keyPressHandler = this.handleKeyDown.bind(this);
        this.keyReleaseHandler = this.handleKeyUp.bind(this);
        this.checkGamepads = this.scangamepads.bind(this);
    }
    
    /**
     * Removes all the event listeners that this manager created
     * 
     * @memberof InputManager
     */
    dispose(){
        if (InputManager.haveGamepadEvents) {
            window.removeEventListener("gamepadconnected", this.gamepadConnectedHandler, false);
            window.removeEventListener("gamepaddisconnected", this.gamepadDisconnectedHandler, false);
        } else if (InputManager.haveWebkitGamepadEvents) {
            window.removeEventListener("webkitgamepadconnected", this.gamepadConnectedHandler, false);
            window.removeEventListener("webkitgamepaddisconnected", this.gamepadDisconnectedHandler, false);
        } else {
            removeInterval(this.checkGamepads);
        }
        
        window.removeEventListener("keypress", this.keyPressHandler, false);
        window.removeEventListener("click", this.mouseClickHandler, false);

        this.cameraControl.dispose();
    }

    /**
     * Creates all the necessary event listeners for this manager to function 
     * 
     * @memberof InputManager
     */
    prepare(){
        if (InputManager.haveGamepadEvents) {
            window.addEventListener("gamepadconnected", this.gamepadConnectedHandler, false);
            window.addEventListener("gamepaddisconnected", this.gamepadDisconnectedHandler, false);
        } else if (InputManager.haveWebkitGamepadEvents) {
            window.addEventListener("webkitgamepadconnected", this.gamepadConnectedHandler, false);
            window.addEventListener("webkitgamepaddisconnected", this.gamepadDisconnectedHandler, false);
        } else {
            setInterval(this.checkGamepads, 500);
        }
        window.addEventListener("keypress", this.keyPressHandler, false);
        window.addEventListener("click", this.mouseClickHandler, false);
        
        this.cameraControl.prepare();
    }

    /**
     * Should be called every frame. Updates camera controls and polls gamepad state.
     * 
     * @memberof InputManager
     */
    update(){
        this.cameraControl.update();
        
        // Need to poll for gamepads. Because Chrome.
        this.checkGamepads();
        
        for (var j in this.controllers) {
            if(!(j in this.gpBtnCallbacks)){
                continue;
            }
            var controller = this.controllers[j];
            for (var i=0; i<controller.buttons.length; i++) {
                var val = controller.buttons[i];
                var pressed = val == 1.0;
                if (typeof(val) == "object") {
                    pressed = val.pressed;
                    val = val.value;
                }
                if(pressed && this.gpBtnCallbacks[j][i] !== undefined){
                    this.gpBtnCallbacks[j][i](val, this.prevButtons[j][i]);
                }
                this.prevButtons[j][i] = pressed;
            }

            for (i = 0; i<controller.axes.length; i++) {
                var val =  controller.axes[i];
                if(this.gpAxisCallbacks[j] !== undefined && this.gpAxisCallbacks[j][i] !== undefined){
                    this.gpAxisCallbacks[j][i](val);
                }
            }
        }
    }

    /**
     * Convienience method for binding a set of controls to this manager.
     * 
     * @param {Object} bindings A mapping of input characters or gamepad buttons to function callbacks.
     * @memberof InputManager
     */
    bindControls(bindings){
        var keys = Object.keys(bindings);
        for(var i in keys){
            if(keys[i].includes("GP")){
                var player, callback;
                if(Array.isArray(bindings[keys[i]])){
                    callback = bindings[keys[i]][0];
                    player = bindings[keys[i]][1];
                }else{
                    callback = bindings[keys[i]];
                    player = 0;
                }
                if(keys[i].includes("AXIS")){
                    this.bindGamepadAxis(keys[i], callback, player);
                }else{
                    this.bindGamepadButton(keys[i], callback, player);
                }
            }else{
                this.bindKey(keys[i], bindings[keys[i]]);
            }
        }
    }

    bindMouse(callback){
        this.mouseCallback = callback;
    }

    //#region Gamepad

    /**
     * Checks for connected gamepads
     * 
     * @memberof InputManager
     */
    scangamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!(gamepads[i].index in this.controllers)) {
                    this.addGamepad(gamepads[i]);
                } else {
                    this.controllers[gamepads[i].index] = gamepads[i];
                }
            }
        }
    }

    /**
     * Adds a gamepad object to this manager.
     * 
     * @param {Object} gamepad The gamepad object gotten from a gamepad event
     * @param {number} gamepad.index The player index of this gamepad
     * @memberof InputManager
     */
    addGamepad(gamepad){
        this.prevButtons[gamepad.index] = {};
        this.controllers[gamepad.index] = gamepad;
    }
    
    /**
     * Removes a gamepad object from this manager.
     * 
     * @param {Object} gamepad The gamepad object gotten from a gamepad event
     * @param {number} gamepad.index The player index of this gamepad
     * @memberof InputManager
     */
    removeGamepad(gamepad){
        delete this.controllers[gamepad.index];
        delete this.prevButtons[gamepad.index];
    }
    
    /**
     * Event handler for connecting a gamepad
     * 
     * @param {Object} event The event that was generated by the listener.
     * @param {Object} event.gamepad The gamepad object that triggered the event.
     * @memberof InputManager
     */
    handleGamepadConnected(event){
        this.addGamepad(event.gamepad);
    }
    
    /**
     * Event handler for removing a gamepad
     * 
     * @param {Object} event The event that was generated by the listener.
     * @param {Object} event.gamepad The gamepad object that triggered the event.
     * @memberof InputManager
     */
    handleGamepadRemoved(event){
        this.removeGamepad(event.gamepad);
    }

    /**
     * Binds a callback to the axis specified.
     * 
     * @param {(number|string)} axis Either the axis alias or index number to be mapped.
     * @param {InputManager~gamepadCallback} callback 
     * @param {number} [player=0] The zero-based player index.
     * @memberof InputManager
     */
    bindGamepadAxis(axis, callback, player = 0){
        if(typeof axis != 'number') {
            axis = InputManager.Axes.indexOf(axis);
        }
        if(axis < 0){
            console.log("Invalid axis binding");
            return;
        }
        if(!(player in this.gpAxisCallbacks)){
            this.gpAxisCallbacks[player] = {};
        }
        this.gpAxisCallbacks[player][axis] = callback;
    }

    /**
     * Attaches callbacks to gamepad button presses
     * 
     * @param {(number|string)} btn Either the button index or alias
     * @param {InputManager~gamepadCallback} callback The function that will be called when the button is pressed
     * @param {number} [player=0] The zero-based player index.
     * @memberof InputManager
     */
    bindGamepadButton(btn, callback, player = 0){
        if(typeof btn != 'number') {
            btn = InputManager.Buttons.indexOf(btn);
        }
        if(btn < 0){
            console.log("Invalid button binding");
            return;
        }
        if(!(player in this.gpBtnCallbacks)){
            this.gpBtnCallbacks[player] = {};
        }
        this.gpBtnCallbacks[player][btn]= callback;
    }
    //#endregion
    
    //#region Keyboard
    
    /**
     * Handles the keydown event and fires appropriate callbacks.
     * Both preventDefault() and stopPropagation() will be called on the event for every key except 'f12' (to allow for opening the debug console).
     * 
     * @param {Object} event The event object which fired this listener
     * @memberof InputManager
     */
    handleKeyDown(event){
        if(event.key != 'F12'){
            event.preventDefault();
            event.stopPropagation();
        }
        
        if(event.key in this.keyCallbacks){
            this.keyCallbacks[event.key].forEach(function(callback){
                callback(event);
            });
        }
    }

    /**
     * TODO. Handles the keyup event
     * 
     * @memberof InputManager
     */
    handleKeyUp(){

    }
        

    /**
     * Adds the callback to the list of functions called when the key is fired.
     * 
     * @param {any} key The key that should fire this callback (matches the string returned by event.key)
     * @param {any} callback The callback that should be invoked.
     * @memberof InputManager
     */
    bindKey(key, callback){
        if(this.keyCallbacks[key] === undefined){
            this.keyCallbacks[key] = [];
        }
        this.keyCallbacks[key].push(callback);
    }

    //#endregion
    
    handleMouseClick(event){
        this.mouseCallback(event.clientX, event.clientY);
    }



    //#region Camera Control
    /**
     * Helper method to enable Trackball style camera controls
     * 
     * @param {Object} camera A THREE.js camera object, or one with equivalent properties.
     * @memberof InputManager
     */
    enableTrackballControl(camera){
        this.cameraControl.dispose();
        this.cameraControl = new THREE.TrackballControls( camera );
    }
    
    /**
     * Helper method to enable Trackball style camera controls
     * 
     * @param {Object} camera A THREE.js camera object, or one with equivalent properties.
     * @param {}
     * @memberof InputManager
     */
    enableOrbitalControl(camera, target){
        this.cameraControl.dispose();
        this.cameraControl = new THREE.OrbitControls( camera );
        this.cameraControl.target = target;
    }
    
    /**
     * TODO: Helper method to enable Pointerlock FPS-style controls 
     * 
     * @param {Object} camera Three.js camera or object with similar interface
     * @param {any} playerPos The position of the player to track
     * @param {number} [moveSpeed=1.0] Movement speed of the camera
     * @param {number} [lookSpeed=0.005] Look speed of the camera
     * @memberof InputManager
     */
    enableFirstPersonControl(camera, playerPos, moveSpeed = 1.0, lookSpeed = 0.005){
        this.cameraControl.dispose();
        this.cameraControl = new THREE.PointerLockControls(camera);
        this.cameraControl.player = playerPos;
        this.cameraControl.update = function(){
            this.getObject().position.set(this.player.x, this.player.y, this.player.z);
        };
        
        
    }
    //#endregion
}


InputManager.haveGamepadEvents = 'GamepadEvent' in window;
InputManager.haveWebkitGamepadEvents = 'WebKitGamepadEvent' in window;

InputManager.Buttons =  [
    "GP_A",
    "GP_B",
    "GP_X",
    "GP_Y",
    "GP_LB", 
    "GP_RB",
    "GP_LT",
    "GP_RT",
    "GP_BACK",
    "GP_START",
    "GP_LEFT_STICK",
    "GP_RIGHT_STICK",
    "GP_DPAD_UP",
    "GP_DPAD_DOWN",
    "GP_DPAD_LEFT",
    "GP_DPAD_RIGHT",
    "GP_GUIDE"
];

InputManager.Axes = [
    "GP_AXIS_LEFT_X",
    "GP_AXIS_LEFT_Y",
    "GP_AXIS_RIGHT_X",
    "GP_AXIS_RIGHT_Y"
];

InputManager.Direction = {
    LEFT: -1,
    RIGHT: 1,
    UP: -1,
    DOWN: 1
};
