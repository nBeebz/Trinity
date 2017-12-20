//=require SceneManager.js

class Trinity{
    constructor(height = window.innerHeight, width = window.innerWidth, startingScene = null){
        this.manager = new SceneManager(height, width, startingScene);
        this.clock = new THREE.Clock();
    }

    addScene(scene){
        if(scene instanceof Scene){
            this.manager.addScene(scene);
        }else{
            console.error("Invalid scene");
        }
    }

    removeScene(scene){
        if(scene instanceof Scene){
            this.manager.removeScene(scene);
        }else{
            console.error("Invalid scene");
        }
    }

    get currentScene(){
        return this.manager.currentScene;
    }
    
    changeScene(scene){
        this.manager.changeScene(scene);
    }

    start(){
        this.frame = window.requestAnimationFrame(this.start.bind(this));
    
        var deltaTime = this.clock.getDelta();
        this.manager.draw(deltaTime);
        document.getElementById('fps').innerHTML = "" + Math.round(1/deltaTime) + " FPS";
    }

    stop(){
        window.cancelAnimationFrame(this.frame);
    }
}