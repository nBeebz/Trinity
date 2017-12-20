//=require trinity/Trinity.js
//=require scenes.js

var myGame = new Trinity();

function startGame(){    

    // Make some scenes for testing
    var wallScene = MakeWallScene();
    myGame.addScene(wallScene);

    var modelScene = MakeModelScene();
    myGame.addScene(modelScene);

    var jengaScene = MakeJengaScene(window);
    myGame.addScene(jengaScene);

    // Controls common across all scenes
    var controls = {
        '1' : function(){
            myGame.changeScene(wallScene);
        },
        '2' : function(){
            myGame.changeScene(modelScene);
        },
        '3' : function(){
            myGame.changeScene(jengaScene);
        },
        'w' : function(){
            console.log("W PRESSED");
        },
        'a' : function(){
            console.log("A PRESSED");
        },
        's' : function(){
            console.log("S PRESSED");
        },
        'd' : function(){
            console.log("D PRESSED");
        },
        "GP_X" : function(value, wasDown){
            if(!wasDown){
                console.log("X BUTTON PRESSED");
            }
        },
        "GP_AXIS_LEFT_X" : function (value){
            if(value > 0.005){
                console.log("AXIS LEFT MOVED: " + value );
            }            
        }
    };
    
    wallScene.input.bindControls(controls);
    modelScene.input.bindControls(controls);
    jengaScene.input.bindControls(controls);
    
    myGame.start();
    
}

startGame();
