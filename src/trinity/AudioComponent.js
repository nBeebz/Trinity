//=require lib/howler/howler.min.js
//=require lib/howler/howler.spatial.min.js


var TAG_AUDIO = 'audio';

/**
 * Wrapper class for sound files and sprites that can be manipulated by the scene.
 * 
 * @class AudioComponent
 */
class AudioComponent{
    /**
     * Creates an instance of AudioComponent.
     * @param {string[]} path The list of sound files to use, will default to first and fallback to others.
     * @param {Object} [options={}] Howler.js sound options for manipulation of parameters.
     * @memberof AudioComponent
     */
    constructor(path, options = {}){
        if(path != undefined){
            options.src = path;
            this.sound = new Howl(options);
        }
        else{
            this.sound = {};
        }
        this.positional = false;
        this.microphone = false;
    }


    /**
     * Called every frame. By default will update the positions for spatial audio.
     * 
     * @memberof AudioComponent
     */
    update(){
        if(this.microphone){
            Howler.pos(this.pos.x, this.pos.y, this.pos.z);
        } 
        if(this.positional){
            this.sound.pos(this.pos.x, this.pos.y, this.pos.z);
        } 
    }

    /**
     * Start/stop the sound playing.
     * 
     * @memberof AudioComponent
     */
    toggle(){
        this.sound.playing() ? this.sound.stop() : this.sound.play();
    }


    /**
     * Play the sound
     * 
     * @memberof AudioComponent
     */
    play(){
        this.sound.play();
    }

    /**
     * Enables 3d positional audio for this sound.
     * 
     * @param {Object} position The position to be used for spatial tracking of this sound.
     * @memberof AudioComponent
     */
    enablePositionalAudio(position){
        this.pos = position;
        this.positional = true;

        this.sound.once('play', function() {
            // Set the position of the speaker in 3D space.
            this.sound.pos(position.x, position.y, position.z);
            this.sound.volume(1);
      
            // Tweak the attributes to get the desired effect.
            this.sound.pannerAttr({
              panningModel: 'HRTF',
              refDistance: 0.8,
              rolloffFactor: 2.5,
              distanceModel: 'exponential'
            });
          }.bind(this));
    }

    /**
     * TODO: Disables 3d positional audio on this sound.
     * 
     * @memberof AudioComponent
     */
    disablePositionalAudio(){
        this.positional = false;
    }

    /**
     * Enable this component as the position of the microphone in the scene for spatial audio.
     * 
     * @param {Object} position The position reference to track.
     * @memberof AudioComponent
     */
    enableMicrophone(position){
        this.microphone = true;
        this.pos = position;
    }
}