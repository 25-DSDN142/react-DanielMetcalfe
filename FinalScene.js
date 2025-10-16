//Daniel Metcalfe
//DSDN142 Assignment 3

//use BothTracker for all elements to be included as the scene is mapped to both the hands and face

let previousDistance = 0; //previous distance is the last recorded right hand position, the last know distance between the wrist and middle finger tip. This is used to make sure mapping the hand to the flower ends up smooth
let previousDistanceLeft = 0; //left hand version of above variable

let frameImages = []; //array for the images loaded into the flower animation
let butterflyFrames = []; //array for the butterfly animation frames

let grass; //static grass image
let clouds;// animated clouds image
let texture; //texture overlay image
let texture2;//texture overlay image

//sun and moon colour switches
let Night= 0; //day night bg lerpColor switch, day =0, 1= night
let Night2= 0; //day night sun and moon lerpColor switch, day =sun/yellow, 1= moon/grey

//clouds
let cloudX = -1280; //first cloud image starting point off left of the screen
let cloudX2 = 0 ;//repetition of cloud image, the starting point for this one, starts halfway through first versions travel across the screen

//butterfly 
let previousFaceX = 0; //how to track where the face was previously to make animation and switch in butterfly direction smoother
let smoothedFaceX = 0; //making the butterfly animation more smooth using lerp
let butterflyFacingRight = false;//variable for changing direction of butterfly to match facemovement
let directionCounter = 0; //counter to make changes from left to right direction of the butterfly smoother
let directionThreshold = 5; //the threshold of when to make the switch in direction for the butterfly, 5 felt fast enough that it responded to the face moving but not too fast that it caused flickering back and forth with subtle face movement
let butterflyFrameNumber = 0; //variable for imaging a frame from the array for the butterfly animation
let butterflyFrameCount = 0; //counter used to make the frameRate of the butterfly animation play at 24fps but keep sketch frame Rate at 60fps to allow smooth animations coded in p5

//instructions UI overlay
let instructions; // instructions image
let showInstructions = true; //true false for mouse click dismissing UI

function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
  
  // Load all 24 frames of the flower animation automatically, loading into array
  
  for (let i = 1; i <= 24; i++) {//for loop for loading all images automatically
    frameImages[i] = loadImage('/images/' + i + '.webp'); //webp for smaller files
  }

  for (let i = 1; i <= 10; i++) {//loading the frames for the butterfly in a similiar way to make it automatic
    butterflyFrames[i] = loadImage('/images/butterfly_' + i + '.webp'); 
  }

  grass = loadImage('/images/grass.png'); //loading the static grass overlay
  clouds = loadImage('/images/clouds.png'); //loading the image for cloud animation
  texture = loadImage('/images/riso1.png'); //loading texture overlay layers
  texture2 = loadImage('/images/riso3.png');
  instructions = loadImage('/images/instructions.png')//loading image for instruction UI overlay
}


function drawInteraction(faces, hands) {

  backgroundElements();// sky, sun/moon, clouds, stars
  
  butterfly(faces);//butterfly mapped to face
  
  flowersAndDayNight(hands); //flowers and day night change mapped to hands
  
  foregroundElements(); //grass and texture overlays

  instructionUI(); //instruction UI for sketch startup
  
}

function backgroundElements() {
   //function to clean up the drawInteractions function
   //sky, stars,sun/moon, clouds
  
  //sky
 
  //colours for the background to morph between day and night
  let blue = color(95,215,255); //blue,day
  let navy = color(0,16,86); //navy, night

  let yellow= color(248,255,68); //yellow,sun
  let grey= color(220); //light grey, moon

  let bgClr= lerpColor ( blue,navy,Night);//lerpColor for controlling day night background colours, controlled by the left hand poses, fist = day, palm open  night
  
  background(bgClr);


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

  
  //clouds

  let cloudSpeed = 20 * frameRate(); //controls the speed of the cloud animation,being used to control the x position, using the frameRate function and times it by 20 to get slower rate as it will be divided by this value next. Using frameRate instead of frameCount so that the animation is always the same
  
  cloudX += (2560) / (cloudSpeed); //the first run of clouds, this animates the clouds by mapping the x position to the frameRate, 1280 is the width of the sketch and the image size, 2560 as that is the distance needed to have the 1280 image go fully of the left and right side of sketch
  cloudX2 += (2560) / (cloudSpeed); //second run of clouds X position, how the movement is created

  if (cloudX > 1280) { //resetting the animation to start on the left again after it goes off the right side of sketch
    cloudX = -1280; //offscreen left
  }

  if (cloudX2 > 1280) { //resetting the animation to start on the left again after it goes off the right side of sketch
    cloudX2 = -1280;
  }

  image(clouds, cloudX, 0, 1280, 960); //imaging the clouds
  image(clouds, cloudX2, 0, 1280, 960);
}



function butterfly(faces) {
  //function to clean up the drawInteractions function
  //butterfly layer
  
  if (faces.length > 0) {
    face = faces[0];
    let faceCenterX = face.faceOval.centerX;
 
    
    if (previousFaceX === 0) { //if there is no face start at the location of the first face when it appears for the first time, this ensures that there is no weird jumping, the butterfly always starts where a face is located
      previousFaceX = faceCenterX; //making is so it always assumes your current face location at start up
      smoothedFaceX = faceCenterX; //smoothed version of face tracking/mapping to make the animation smoother
    }

    smoothedFaceX = lerp(smoothedFaceX, faceCenterX, 0.15); //using lerp to make the animation less jittery, essentially makes the next face location closer to the previous face location instead of actual face location, so that there is less of a jump between animation positions. Coding train lerp video was helpful with this
    
    if (faceCenterX > previousFaceX) {  // if face goes to the right of where it was previously
      directionCounter++; ///add 1 to counter, counter is setup to make it only make changes to butterfly direction after 5 instances of the face moving in that direction to ensure smooth animations
      if (directionCounter > directionThreshold) {//if direction counter is more than 5( the threshold I set) make it face right. This threshold makes it smoother so it only changes the butterfly direction if the face moves 5 spots in that direction, this stops any flickering back and forth that can occur from subtle face movements
        butterflyFacingRight = true; //butterfly right facing
        directionCounter = 0; //reset counter
      }
    } else if (faceCenterX < previousFaceX) { //if the face goes to the left of where it was previously
      directionCounter--; //remove 1 from counter
      if (directionCounter < -directionThreshold) { //if direction counter is less than 5( the threshold I set) make it face right. This threshold makes it smoother so it only changes the butterfly direction if the face moves 5 spots in that direction, this stops any flickering back and forth that can occur from subtle face movements
        butterflyFacingRight = false; // butterfly face left
        directionCounter = 0; //reset counter
      }
    }

   butterflyFrameCount++; //counter to count the buttterflyFrames/time in sketch, adding 1 to it to play through frames, used to make the animation 24fps in a 60fps sketch
    
    if (butterflyFrameCount >= 2.5) { //way of making it 24fps in 60fps sketch. Only imaging a frame every 2.5 frameCounter instances
    
     butterflyFrameCount = 0; //reset the counter back to 0;
      butterflyFrameNumber++; //add 1 to the frame number, making it play the next frame as that is the variable I am using down below to image the butterfly, happens every 2.5 frameCounts
     
     
      if (butterflyFrameNumber > 10) { //resetting the frames to frame 1 once it reaches the end of the frames(10 frames)
        butterflyFrameNumber = 1;//frame 1
      }
    }

    if (butterflyFrameNumber === 0) {  //making sure the animation always starts at the first frame by setting it so that if there is no frame played yet it assumes frame 1, so there is no weird jumps in frames
      butterflyFrameNumber = 1; //frame 1
    }
    
    imageMode(CENTER); // making the image centered so it is centered on the face that is being tracked
    
    push();
    
    translate(smoothedFaceX, 400);// controlling the location of butterfly with translate to make it remain in the same place when flipped below
    
    if (!butterflyFacingRight) { // if statement to flip the butterfly so I can just load one image instead of an image for both directions
      scale(-1, 1); //using scale to flip the x axis of the image
    }
    
    image(butterflyFrames[butterflyFrameNumber], 0, 0, 175, 175); //imaging the butterfly
    
    pop();
    
    previousFaceX = faceCenterX; //setting previousFaceX variable so it is always where the current face is,updates every loop of the function to be up to date, ensuring smooth animations of the butterfly by giving the if statements above an accurate location of the face to work from
  }

  imageMode(CORNER); ///resetting the imageMode so the rest of the images aren't effected
}

function flowersAndDayNight(hands) {
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

  }
}

function foregroundElements() {
//function to clean up the drawInteractions function
//static grass and texture overlays

//grass

image(grass, 0, 0, width, height);//imaging the static grass overlay


//texture overlays to give more character to sketch
  
tint(255, 80); //using tint function to overlay some textures over the top of sketch by adusting opacity
image(texture, 0, 0, width, height); //texture 1
tint(255, 255); //resetting opacity to 100 percent

tint(255, 30); 
image(texture2, 0, 0, width, height); //texture2
tint(255, 255);//resetting opacity to 100 percent
}


function instructionUI() {
  //function to clean up drawInteraction function
  //images an instructional UI at start up
  
  if (showInstructions) {// true false variable to dismiss UI with mouse click
    image(instructions, 0, 0, width, height);
  }
}

function mouseReleased() {
  //function to dismiss instruction UI by clicking mouse 
  
  showInstructions = false;
}
