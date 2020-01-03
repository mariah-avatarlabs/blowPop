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

// Diagnostics.log(Patches.getPoint2DValue('lanternOffset'))

const fishLane0 = Scene.root.find("fish_lane_0");

// trackerRect.transform.x = scaledXB.sub(canvasBoundsWidth.div(2));


const demoFish = Scene.root.find("fish_lane_0");



let resetTimeDriver = () => {
    let driverDuration = Math.floor(Math.random() * 25) + 10;
    let timeDriver = Animation.timeDriver({
        durationMilliseconds: driverDuration * 100,
        loopCount: 1,
        mirror: false  
    });

    return timeDriver;

};

class Lane {
    constructor(sceneObj) {
      this.root = sceneObj;
      this.fish = this.root.child('fishMesh');
      this.animationObj = null;
      
      this.isActive = false;
      this.timeDriver = null;
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
        this.isActive = true;

        this.root.transform.x = this.animationObj;

        this.timeDriver.start();
        this.timeDriver.onCompleted().subscribe(() => {
            this.isActive = false;
            this.startAnim(); 

        })
    }

  }



// const fishLane0 = Scene.root.find("fish_lane_0");
let lane0 = new Lane(fishLane0)
lane0.startAnim()

const fishLane1 = Scene.root.find("fish_lane_1");
let lane1 = new Lane(fishLane1)
lane1.startAnim()

const fishLane2 = Scene.root.find("fish_lane_2");
let lane2 = new Lane(fishLane2)
lane2.startAnim()

let mouthOffset = 0.5;




// FaceTracking.face(0).mouth.center.x.monitor().subscribe(function(e) {
//     mouthCoord.x = e.newValue
// })

// FaceTracking.face(0).mouth.center.y.monitor().subscribe(function(e) {
//     mouthCoord.y = canvasBoundsWidth.mul(e.newValue)

//   FaceTracking.face(0).cameraTransform.position.y.monitor().subscribe(() => {
//     Diagnostics.log(canvasBoundsHeight.mul(e.newValue).lastValue);

//   })
//     // Diagnostics.log(canvasBoundsWidth.mul(e.newValue).lastValue);

//     // const canvasBoundsWidth = canvasBounds.height;

//     // if( 
//     //     mouthOpenness.pinLastValue() > 0.5 
//     // ){
//     //     Diagnostics.log(e.newValue);
//     //     Diagnostics.log(FaceTracking.face(0).mouth.center.y.lastValue);
//     //     Diagnostics.log("HIT");    

//     // }
// })

FaceTracking.face(0).mouth.openness.monitor().subscribe((e) => {
    // Diagnostics.log(e.newValue);

    if( e.newValue > 0.5 ){
    }

})



// const fishLane2 = Scene.root.find("fish_lane_2");




// let fishLaneAnim = function(fishPosX){
    
//     let timeDriver = resetTimeDriver();

//     timeDriver.onAfterIteration().subscribe((e) => {
//         timeDriver = Animation.timeDriver( randTimeDriver() );
//         Diagnostics.log(e)

//     })    

//     const quadraticSampler = Animation.samplers.easeInOutQuad(0.3, -0.5);
//     const translationAnimation = Animation.animate(timeDriver, quadraticSampler);


//     fishLane1.transform.x = translationAnimation;

//     timeDriver.start();



// }();

var fishPosX = 0;



demoFish.transform.x.monitor().subscribe((e) => {
    // let fishPosX = e.newValue;
    fishPosX = e.newValue;
    
    let fishPosXNorm = canvasBoundsWidth.mul(e.newValue);

    // Diagnostics.log(fishPosXNorm);    

})





