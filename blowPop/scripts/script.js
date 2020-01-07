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


const camera = Scene.root.find("Camera");
// Patches.setScalarValue('focalplanedistance', camera.focalPlane.distance);


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
testRect.transform.x = scaledX.sub(canvasBoundsWidth.div(2));
testRect.transform.y = scaledY.sub(canvasBoundsHeight.div(2)).mul(-1);

const mouthRect = Scene.root.find("mouthTracker");


const mouth = FaceTracking.face(0).mouth.center;

var mouthX = FaceTracking.face(0).cameraTransform.applyTo(mouth).x;
var mouthY = FaceTracking.face(0).cameraTransform.applyTo(mouth).y;

mouthRect.transform.x = mouthX.mul(1000);
mouthRect.transform.y = mouthY.mul(1000);

Patches.setPoint2DValue(
    'lanternOffset', 
    Reactive.point2d(
        mouthRect.transform.x,
        mouthY.mul(-500)
    )
);

// Diagnostics.watch('noseCenterX', FaceTracking.face(0).cameraTransform.applyTo(nose).x);

var mouthOffset = -50;

// mouthRect.transform.x = scaledX.sub(canvasBoundsWidth.div(2));
// mouthRect.transform.y = scaledY.sub(canvasBoundsHeight.div(2)).mul(-1);


let resetTimeDriver = () => {
    let driverDuration = Math.floor(Math.random() * 40) + 30;
    let timeDriver = Animation.timeDriver({
        durationMilliseconds: driverDuration * 100,
        loopCount: 1,
        mirror: false  
    });

    return timeDriver;

};

// -- SCOREBOARD CLASS -- // 
class Score {
    constructor(){
        this.score = '00';

        this.init();
    }
    
    init(){
        this.updateScoreBoard();
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

// -- LANE CLASS -- // 
class Lane {
    constructor(sceneObj, key, scoreboard) {
        this.key = key;
        this.scoreboard = scoreboard;
        this.root = sceneObj;
        
        this.trackerObj = Scene.root.find('tracker_' + key);
        this.fish = this.root.child('fishMesh');

        this.animationObj = null;
        this.isActive = false;
        this.timeDriver = null;

        this.widthTan = canvasBoundsWidth.div(2);

        this.screenPos = {
            x: this.trackerObj.transform.x,
            y: this.trackerObj.transform.y,
        };

        this.assignYPos();
    }
    assignYPos(){
        let multiplier = this.key.charAt(this.key.length - 1);

        // y position of fish obj
        var transformRoot = parseInt(multiplier) * -1.75

        var canvHeightCoordHalf = canvasBoundsHeight.div(2);
        
        // need to revisit - need to find exact height in world space of focal plane
        // Diagnostics.watch('focalheight: ', camera.focalPlane.height);
        // Diagnostics.watch('focaldist: ', camera.focalPlane.distance);

        // need to revisit - who does need to be negative?
        var focalOffset = camera.focalPlane.height.mul(-10);
        var intNrml = canvHeightCoordHalf.div(focalOffset);

        // refactor
        this.fish.transform.y = transformRoot;
        this.trackerObj.transform.y = intNrml.mul(this.fish.transform.y).mul(-1);
    }

    hit(){
        if(this.isActive){
            this.scoreboard.scored();
            this.deactivate();
        }
    }

    deactivate(){
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
        const quadraticSampler = Animation.samplers.easeInOutQuad(10, -10);
        const translationAnimation = Animation.animate(this.timeDriver, quadraticSampler);        
        this.animationObj = translationAnimation;
    }

    startAnim() {
        this.resetTimeDriver();
        this.resetAnimation();
        this.activate();
        // Diagnostics.log('laneScreenPos: ' + this.screenPos.x.lastValue);

        // this.root.transform.x = this.animationObj;
        this.fish.transform.x = this.animationObj;

        var scale1 = canvasBoundsWidth.mul(this.fish.transform.x);
        var scaleH = canvasBoundsHeight.mul(this.root.transform.y);
        // return scale1.div(5);

        this.trackerObj.transform.x = scale1.div(5.75)

        this.timeDriver.start();
        this.timeDriver.onCompleted().subscribe(() => {
            this.isActive = false;
            this.startAnim(); 

        })
    }

  }




// -- SCOREBOARD OBJ -- // 
let gloablScoreboard = new Score();



// -- FISH LANES -- // 
const fishLane0 = Scene.root.find("fish_lane_0");
let lane0 = new Lane(fishLane0, 'lane0', gloablScoreboard)
lane0.startAnim()

const fishLane1 = Scene.root.find("fish_lane_1");
let lane1 = new Lane(fishLane1, 'lane1', gloablScoreboard)
lane1.startAnim()

const fishLane2 = Scene.root.find("fish_lane_2");
let lane2 = new Lane(fishLane2, 'lane2', gloablScoreboard)
lane2.startAnim()



// -- COLLISION DETECTION -- //
FaceTracking.face(0).mouth.openness.monitor().subscribe((e) => {
    if(e.newValue > 0.5){

        let currMouthPosY = mouthRect.transform.y.pinLastValue();
        let currMouthPosX = mouthRect.transform.x.pinLastValue();

        let currLane0PosY = lane0.trackerObj.transform.y.pinLastValue();
        let currLane0PosX = lane0.trackerObj.transform.x.pinLastValue();

        let currLane1PosY = lane1.trackerObj.transform.y.pinLastValue();
        let currLane1PosX = lane1.trackerObj.transform.x.pinLastValue();

        let currLane2PosY = lane2.trackerObj.transform.y.pinLastValue();
        let currLane2PosX = lane1.trackerObj.transform.x.pinLastValue();

        let modellOffset = 50;


        // refactor - not tracking mouth correctly
        if(currMouthPosY < 50 && currMouthPosY > currLane0PosY){

            if(
                currMouthPosX > currLane0PosX - modellOffset &&
                currMouthPosX < currLane0PosX + modellOffset
            ) {
                Diagnostics.log('HIT INT');
                lane0.hit();
            }

        } 


        if(
            currMouthPosY < (currLane1PosY - mouthOffset) && 
            currMouthPosY > (currLane1PosY + mouthOffset)
        ){
            if(
                currMouthPosX > currLane1PosX - modellOffset &&
                currMouthPosX < currLane1PosX + modellOffset
            ) {
                Diagnostics.log('HIT INT 1');
                lane1.hit();
            }

        } 


        if(
            currMouthPosY < (currLane2PosY - mouthOffset) && 
            currMouthPosY > (currLane2PosY + mouthOffset)
        ){
            if(
                currMouthPosX > currLane2PosX - modellOffset &&
                currMouthPosX < currLane2PosX + modellOffset
            ) {
                Diagnostics.log('HIT INT 2');
                lane2.hit();
            }

        } 



    }

})






