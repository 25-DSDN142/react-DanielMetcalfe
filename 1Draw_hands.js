// ----=  HANDS  =----
/* load images here */
let frameImages = []; //array for the images loaded into the flower animation
let previousDistance = 0; //previous distance is the last recorded hand position, the last know distance between the wrist and middle finger tip. This is used to make sure mapping the hand to the flower ends up smooth
let previousDistanceLeft = 0;
let grass; //static grass image
let clouds;// animated clouds image
let texture;
let texture2;

let Night= 0; //day night bg lerpColor switch, day =0, 1= night
let Night2= 0;

let cloudX = -1280; //first cloud image starting point off left of the screen
let cloudX2 = 0 ;//repetition of cloud image, the starting point for this one, starts halfway through first versions travel across the screen

function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
  
  // Load all 24 frames
  for (let i = 1; i <= 24; i++) {//for loop for loading all images automatically
    frameImages[i] = loadImage('/images/' + i + '.webp'); //webp for smaller files
  }

  grass = loadImage('/images/grass.png'); //loading the static grass overlay
  clouds = loadImage('/images/clouds.png'); //loading the image for cloud animation
  texture = loadImage('/images/riso1.png'); //loading texture overlay layers
  texture2 = loadImage('/images/riso3.png');
}

function drawInteraction(faces, hands) {

  //colours for the background to morph between day and night
  let blue = color(95,215,255); //blue,day
  let navy = color(0,16,86); //navy, night

  let yellow= color(248,255,68); //yellow,sun
  let grey= color(220); //light grey, moon



  let bgClr= lerpColor ( blue,navy,Night);//lerpColor for controlling day night background colours, controlled by the left hand poses, fist = day, palm open  night
  
  background(bgClr);//test bg

  //stars

  if (Night > 0.3) { //making it so the stars only appear at night, using the same frame work that maps the left hand to colour to control this

  randomSeed(50); // locking randomness so that it doesn't change every frame, I just liked how it looked at 50 so went with that
  noStroke();
 for (let i = 0; i < 350; i++) { //for loop for the stars so I could make it in p5, 350 stars looked good
  
  let x = random(width); //random placement between 0 and width 
  let y = random(height); //random placement between 0 and height

  let starSize = random(2, 3); //setting the size of the stars randomly between 2 and 3 pixels for variation
  let brightness = random(100, 255); //randomly setting the brightness of a star so it looks more like stars, randomly choosing a different greyscale tone to emulate brightness differences
  
  fill(brightness);// star brightness/colour
  
  circle(x, y, starSize); //individual star
}
  }

//sun and moon
  let circleColour = lerpColor ( yellow, grey, Night2);  //lerpColor to map the left hand to morph between sun and moon when it goes from day to night
 
  push();
   
stroke(12);
fill(circleColour);

  let circleX= (width *(2/3)+80); // sun/moon x location
  let circleY= height/4;// sun/moon y location
  let circleSize= 150; // sun/moon size

  ellipse(circleX,circleY,circleSize); //sun/moon

  pop();



  ///clouds
  
  let cloudSpeed = 20 * frameRate(); //controls the speed of the cloud animation,being used to control the x position, using the frameRate function and times it by 20 to get slower rate as it will be divided by this value next. Using frameRate instead of frameCount so that the animation is always the same
  
  cloudX += (2560) / (cloudSpeed); //the first run of clouds, this animates the clouds by mapping the x position to the frameRate, 1280 is the width of the sketch and the image size, 2560 as that is the distance needed to have the 1280 image go fully of the left and right side of sketch
  cloudX2 += (2560) / (cloudSpeed); //second run of clouds X position, how the movement is created

  if (cloudX > 1280) { //resetting the animation to start on the left again after it goes off the right side of sketch
    cloudX = -1280;
  }

  if (cloudX2 > 1280) { //resetting the animation to start on the left again after it goes off the right side of sketch
    cloudX2 = -1280;
  }

  image(clouds, cloudX, 0, 1280, 960); //imaging the clouds
  image(clouds, cloudX2, 0, 1280, 960);



  // hands part
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
 
    if (showKeypoints) {
      drawConnections(hand)
    }

    // This is how to load in the x and y of a point on the hand.
    let wristX = hand.wrist.x;
    let wristY = hand.wrist.y;
    let middleFingerTipX = hand.middle_finger_tip.x;
    let middleFingerTipY = hand.middle_finger_tip.y;

    /*
    Start drawing on the hands here
    */

   if (hand.handedness === "Right") { // mapping the right hand to controlling the flower growth
      
    let distance = dist(wristX, wristY, middleFingerTipX, middleFingerTipY); //how to calculate whether fist or open using distance between wrist and middle finger
    
    if (previousDistance === 0) { //a way to make it so that the first frame that is shown is always the position that your hand is at, rather than starting from somewhere else and rapidly jolting to that position, this makes it smoother but also makes it feel more interactive
      previousDistance = distance; // starts previous distance at whatever the distance between the wrist and middle finger is, essentially what your hand position is
    }
    
    let smoothedDistance = lerp(previousDistance, distance, 0.3); //making the animation smoother by essentially taking a point in between the previous distance and new distance of the points on the hand, this ensures that the frame that is displayed is close enough to the previous one that is doesn't get jumpy, this is repeated for the next frame etc so it always goes forwards or backwards in frames but it does it slower than realtime movement. the 0.3 value makes it slower to transition to the next as it keeps the point closer to the previous distance than the new distance. coding train lerp video helped with this
    previousDistance = smoothedDistance; //setting the previous distance as this new inbetween value for smooth
    
    let minDistance = 100;  //fist motif with the hand
    let maxDistance = 300; // palm open
    
    let frameNum = map(smoothedDistance, minDistance, maxDistance, 1, 24); //mapping frame number to distance using smoothed value to keep smooth animation
    
    frameNum = constrain(frameNum, 1, 24); // Keep it inside number of frames so that it never breaks, eg if someones hand is really big or really small and goes over the min or max 
    frameNum = round(frameNum); // Make it an integer, ensures that it always plays a frame as the frames are number 1 through 24
    
    
    if (frameImages[frameNum]) {// imaging flowers frame
     
      push();
      image(frameImages[frameNum], 0, 0, width, height); //imaging
      pop();
    }
  }

  if (hand.handedness === "Left") { //setting up left hand to be mapped to switching between day and night scene

    //same code that maps the fist and palm open to the flowers just mapped to lerpColor morph value instead

    let distanceLeft = dist(wristX, wristY, middleFingerTipX, middleFingerTipY);  //distance between the wrist and middlefinger tip as a way of getting in between hand poses between closed fist and open palm
    
    if (previousDistanceLeft === 0) { //making sure it always starts at whatever position the hand is in, so there are no weird jumps in colour
      previousDistanceLeft = distanceLeft;
    }
    
    let smoothedDistanceLeft = lerp(previousDistanceLeft, distanceLeft, 0.3);// making the transition between handposes more smooth since distances can change quickly and look jumpy
    previousDistanceLeft = smoothedDistanceLeft;
    
    let minDistance = 100;//fist, minimum distance between the wrist and middlefinger tip used to map the start position of the lerpColor value ,0 
    let maxDistance = 300;//palm open, maximum distance, used as the distance between the wrist and finger that marks the end of the lerpColor value, 1
    
    //bg colour
    Night = map(smoothedDistanceLeft, minDistance, maxDistance, 0, 1); //mapping the position/distance of the hand to the morph section of lerpColor to change the colour from blue to navy
    Night = constrain(Night, 0, 1); //making it so that it can't go outside 0 and 1 incase someones hand is bigger/smaller than the min max
  
     //sun and moon colour
    Night2 = map(smoothedDistanceLeft, minDistance, maxDistance, 0, 1); //mapping the position/distance of the hand to the morph section of lerpColor to change the colour from blue to navy
    Night2 = constrain(Night2, 0, 1); //making it so that it can't go outside 0 and 1 incase someones hand is bigger/smaller than the min max
  }

    
    // drawPoints(hand)

   

    /*
    Stop drawing on the hands here
    */
  }

  
  image(grass, 0, 0, width, height);//imaging the static grass overlay


  //texture overlays to give more character to sketch
  
tint(255, 80); //using tint function to overlay some textures over the top of sketch by adusting opacity
  image(texture, 0, 0, width, height); //texture 1
  tint(255, 255); //resetting opacity to 100 percent

  tint(255, 30); 
  image(texture2, 0, 0, width, height); //texture2
  tint(255, 255);//resetting opacity to 100 percent
 
 
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------
}



function pinchCircle(hand) { // adapted from https://editor.p5js.org/ml5/sketches/DNbSiIYKB
  // Find the index finger tip and thumb tip
  let finger = hand.index_finger_tip;
  //let finger = hand.pinky_finger_tip;
  let thumb = hand.thumb_tip;

  // Draw circles at finger positions
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  // Calculate the pinch "distance" between finger and thumb
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  // This circle's size is controlled by a "pinch" gesture
  fill(0, 255, 0, 200);
  stroke(0);
  strokeWeight(2);
  circle(centerX, centerY, pinch);
}

function chameleonHandPuppet(hand) {
  // Find the index finger tip and thumb tip
  // let finger = hand.index_finger_tip;

  let finger = hand.middle_finger_tip; // this finger now contains the x and y infomation! you can access it by using finger.x 
  let thumb = hand.thumb_tip;

  // Draw circles at finger positions
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  // Calculate the pinch "distance" between finger and thumb
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  // This circle's size is controlled by a "pinch" gesture
  fill(0, 255, 0, 200);
  stroke(0);
  strokeWeight(2);
  circle(centerX, centerY, pinch);

  let indexFingerTipX = hand.index_finger_tip.x;
  let indexFingerTipY = hand.index_finger_tip.y;
  fill(0)
  circle(indexFingerTipX, indexFingerTipY, 20);
}

function drawConnections(hand) {
  // Draw the skeletal connections
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}

// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {
  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 10);
  }
  pop()
}