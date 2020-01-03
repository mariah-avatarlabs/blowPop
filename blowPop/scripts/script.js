/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const FaceTracking = require('FaceTracking');
const Patches = require('Patches');
const FaceTracking2D = require('FaceTracking2D');
const Diagnostics = require('Diagnostics');
const Reactive = require('Reactive');
const Animation = require('Animation');

const face = FaceTracking.face(0);
let mouthCoord = {
    x: null,
    y: null
};
const mouthOpenness = FaceTracking.face(0).mouth.openness;

const canvas = Scene.root.find("screenDim");
const canvasBounds = canvas.bounds;
const canvasBoundsWidth = canvasBounds.width;
const canvasBoundsHeight = canvasBounds.height;

const face2D = FaceTracking2D.face(0);
const face2DBounds = face2D.boundingBox;
const face2DBoundsCenter = face2DBounds.center;

// Convert the normalized screen space value for x and y by multiplying by the
// width and height of the canvas
const scaledX = face2DBoundsCenter.x.mul(canvasBoundsWidth);
const scaledY = face2DBoundsCenter.y.mul(canvasBoundsHeight);

const testRect = Scene.root.find("tester");
const trackerRect = Scene.root.find("tracker");

testRect.transform.x = scaledX.sub(canvasBoundsWidth.div(2));
testRect.transform.y = scaledY.sub(canvasBoundsHeight.div(2)).mul(-1);

Patches.setPoint2DValue('lanternOffset', 
    Reactive.point2d(
        scaledX.sub(canvasBoundsWidth.div(2)),
        scaledY.sub(canvasBoundsHeight.div(2))
    )
);





let resetTimeDriver = () => {
    let driverDuration = Math.floor(Math.random() * 40) + 20;
    let timeDriver = Animation.timeDriver({
        durationMilliseconds: driverDuration * 100,
        loopCount: 1,
        mirror: false  
    });

    return timeDriver;

};

class Score {
    constructor(){
        this.score = '00';
    }

    scored(hasBonus = false) {
        let newScore = parseInt(this.score);
        
        if(hasBonus){
            newScore += 50;
        } else {
            newScore += 10;
        }

        this.score = newScore.toString();
        this.updateScoreBoard();
    }

    updateScoreBoard(){
        Patches.setStringValue('scoreText', Reactive.val(this.score));
    }

}

class Lane {
    constructor(sceneObj, key, scoreboard) {
        this.key = key;
        this.scoreboard = scoreboard;
        this.root = sceneObj;
        this.fish = this.root.child('fishMesh');
        this.animationObj = null;
        
        this.isActive = false;
        this.timeDriver = null;
    }

    hit(){
        if(this.isActive){
            this.scoreboard.scored();
            this.deactivate();
        }
    }

    deactivate(){
        // Diagnostics.log('deactivate' + this.key)
        this.isActive = false;
        Patches.setBooleanValue(this.key + '_active', Reactive.val(false)) 
    }

    activate(){
        this.isActive = true;
        Patches.setBooleanValue(this.key + '_active', Reactive.val(true)) 
    }

    resetTimeDriver(){
        this.timeDriver = resetTimeDriver();
    }

    resetAnimation(){
        const quadraticSampler = Animation.samplers.easeInOutQuad(0.3, -0.5);
        const translationAnimation = Animation.animate(this.timeDriver, quadraticSampler);        
        this.animationObj = translationAnimation;
    }

    startAnim() {
        this.resetTimeDriver();
        this.resetAnimation();
        this.activate();

        this.root.transform.x = this.animationObj;

        this.timeDriver.start();
        this.timeDriver.onCompleted().subscribe(() => {
            this.isActive = false;
            this.startAnim(); 

        })
    }

  }


let gloablScoreboard = new Score();

// const fishLane0 = Scene.root.find("fish_lane_0");
const fishLane0 = Scene.root.find("fish_lane_0");
let lane0 = new Lane(fishLane0, 'lane0', gloablScoreboard)
lane0.startAnim()

const fishLane1 = Scene.root.find("fish_lane_1");
let lane1 = new Lane(fishLane1, 'lane1', gloablScoreboard)
lane1.startAnim()

const fishLane2 = Scene.root.find("fish_lane_2");
let lane2 = new Lane(fishLane2, 'lane2', gloablScoreboard)
lane2.startAnim()

let mouthOffset = 0.5;


FaceTracking.face(0).mouth.openness.monitor().subscribe((e) => {
    if(e.newValue > 0.5){

        let currMouthPos = FaceTracking.face(0).mouth.center.y.lastValue;
        // Diagnostics.log(e.newValue);
        lane0.hit()

    
        // -- Lane 0 -- //
        // if(
        //     currMouthPos < 0 && 
        //     currMouthPos > -0.075 &&
        //     lane0.isActive == true            
        // ){
        //     lane0.hit()
        // }

    }

})


// FaceTracking.face(0).mouth.center.x.monitor().subscribe(function(e) {
//     Diagnostics.log(e.newValue);
//     // mouthCoord.x = e.newValue
// })

FaceTracking.face(0).mouth.center.y.monitor().subscribe(function(e) {
    // let mouthScreenCoord = {
    //     x: 0, y: 0
    // }

    const mouthScaledX = FaceTracking.face(0).mouth.center.x.mul(canvasBoundsWidth);
    const mouthScaledY = FaceTracking.face(0).mouth.center.y.mul(canvasBoundsHeight);

    trackerRect.transform.x = mouthScaledX.sub(canvasBoundsWidth.div(2));
    trackerRect.transform.y = mouthScaledY.sub(canvasBoundsWidth.div(2)).mul(-1);
    
    trackerRect.transform.x = mouthScaledX;
    trackerRect.transform.y = mouthScaledY;
    
    
})








