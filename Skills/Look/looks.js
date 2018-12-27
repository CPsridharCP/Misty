misty.Debug("Starting Looks !!");

misty.Set("pitch", 0.0);
misty.Set("yaw", 0.0);
misty.Set("roll", 0.0);


misty.Set("faceDetectedAt", (new Date()).toUTCString());
misty.Set("pastElevation", 0.0);
misty.Set("pastBearing", 0.0);
misty.Set("lookAround", true);
misty.Set("lookStartTime",(new Date()).toUTCString());
misty.Set("timeInLook",6.0);
misty.Set("touchAt", (new Date()).toUTCString());
misty.Set("inTouch",false);

misty.Debug("Centering Head");
misty.MoveHeadPosition(0, 0, 0, 100);
misty.Pause(3000);

// Used for LED gradient changes
misty.Set("pastState", "skillStarted");
misty.Set("loop1", true);
misty.ChangeLED(0,0,0); //Purple

//misty.StartFaceRecognition();
misty.StartFaceDetection();
registerFaceFollow();

function registerFaceFollow(){
	misty.AddPropertyTest("FaceFollow", "PersonName", "exists", "", "string");
	misty.RegisterEvent("FaceFollow", "ComputerVision", 400, true);
}

registerCaptouch();
function registerCaptouch(){
	misty.AddReturnProperty("Touched", "sensorName");
	misty.RegisterEvent("Touched", "TouchSensor", 250 ,true);
}

// -----------------------------Cap Touch--------------------------------------------------------

misty.Set("touchTimeout", 3);

function _Touched(data) {

	if (!misty.Get("inTouch")){
		misty.Set("inTouch", true);
		misty.UnregisterEvent("FaceFollow");
		misty.Set("touchAt", (new Date()).toUTCString());

		var sensor = data.AdditionalResults[0];
		misty.Debug(sensor);

		switch(sensor) {
			case "CapTouch_HeadFront":
				misty.PlayAudioClip("chin_amp.wav");
				misty.Set("eyeMemory", "Happy.png");
				misty.ChangeDisplayImage("Happy.png");
				misty.Set("blinkStartTime",(new Date()).toUTCString());
				misty.Set("timeBetweenBlink",3);
				blink_now();
				misty.Set("touchTimeout", 6);
				misty.SetHeadPosition("roll", -4.5, 100);
			 	break;
			case "CapTouch_HeadBack":
				misty.PlayAudioClip("head_amp.wav");
				misty.Set("eyeMemory", "Wonder.png");
				misty.ChangeDisplayImage("Wonder.png");
				misty.Set("blinkStartTime",(new Date()).toUTCString());
				misty.Set("timeBetweenBlink",3);
				blink_now();
				misty.Set("touchTimeout", 6);
				misty.SetHeadPosition("roll", 4.5, 100);
			 	break;
			default:
				misty.PlayAudioClip("043-Bbbaaah.wav");
				misty.ChangeDisplayImage("Angry.png");
				misty.Set("eyeMemory", "Angry.png");
				misty.Set("blinkStartTime",(new Date()).toUTCString());
				misty.Set("timeBetweenBlink",3);
				misty.Set("touchTimeout", 3);

			  // code block
		  }

	}
 //    CapTouch_Scruff
 //    CapTouch_HeadTop
 //    CapTouch_HeadBack
 //    CapTouch_HeadFront
 //    CapTouch_ChinLeft
 //    CapTouch_ChinRight
}

// -----------------------------Face Follow--------------------------------------------------------

//misty.Set("yawPtimeout", (new Date()).toUTCString());
//misty.Set("yawNtimeout", (new Date()).toUTCString());

misty.Set("setPitch", 0.0);
misty.Set("setYaw", 0.0);

function _FaceFollow(data){
    
    try{
		// TODO Turn off Look Around
		misty.Set("lookAround", false);
		if (misty.Get("pastState") != "faceFollow"){
			misty.Set("pastState", "faceFollow");
			green_up();
		}

        var bearing = data.PropertyTestResults[0].PropertyParent.Bearing * 0.25 * 0.1;
		var elevation = data.PropertyTestResults[0].PropertyParent.Elevation * 0.3 * 0.1;
		
		bearing = min_increment(bearing);
		elevation = min_increment(elevation);

		var to_pitch = misty.Get("pitch"); 
		var to_yaw = misty.Get("yaw"); 
		to_pitch = set_in_range(to_pitch + elevation);
		to_yaw = set_in_range(to_yaw + bearing);

		// Avoiding Oscillations - the next two IFs ______ THIS IS WRONG

		var pastBearing = misty.Get("pastBearing");
		var pastElevation = misty.Get("pastElevation");
		if (Math.sign(pastBearing) == Math.sign(bearing) && Math.abs(misty.Get("setYaw")-to_yaw)>=0.5){
			misty.SetHeadPosition("yaw", to_yaw, 100);
			misty.SetHeadPosition("roll", 0, 100);
			misty.Set("setYaw", to_yaw);

		}
		if (Math.sign(pastElevation) == Math.sign(elevation) && Math.abs(misty.Get("setPitch")-to_pitch)>=0.5){
			misty.SetHeadPosition("pitch", to_pitch, 100);
			misty.SetHeadPosition("roll", 0, 100);
			misty.Set("setPitch", to_pitch);
		}
		
		misty.Debug(to_yaw+" , "+to_pitch);
		misty.Set("pastElevation", elevation);
		misty.Set("pastBearing", bearing);       
		//misty.Debug(to_yaw+" , "+to_pitch);
        //misty.MoveHeadPosition(to_pitch, 0, to_yaw, 100);
        misty.Set("pitch", to_pitch);
		misty.Set("yaw", to_yaw);
		
		misty.Set("faceDetectedAt", (new Date()).toUTCString());

    } catch (err) {
        misty.Debug("Some Error");
    }
}

function set_in_range(value){
	return Math.min((Math.max(value,-5.0)),5.0);
}

function min_increment(value){

	if (Math.abs(value) <= 0.15) {
		
		return 0.0;

	} else if (Math.abs(value) > 0.15){
		
		return 0.15*Math.sign(value);
	}
	
}

//-------------------------Blink--------------------------------------------------------
misty.Set("eyeMemory", "Homeostasis.png");
misty.Set("blinkStartTime",(new Date()).toUTCString());
misty.Set("timeBetweenBlink",5);

function blink_now(){
    misty.Set("blinkStartTime",(new Date()).toUTCString());
    misty.Set("timeBetweenBlink",getRandomInt(2, 8));
    misty.ChangeDisplayImage("blinkMisty.png");
    misty.Pause(200);
    misty.ChangeDisplayImage(misty.Get("eyeMemory"));
}

//-------------------------Random Hand Movement--------------------------------------------
misty.Set("handsStartTime",(new Date()).toUTCString());
misty.Set("timeBetweenHandMotion",5);

function move_hands(){
    misty.Set("handsStartTime",(new Date()).toUTCString());
	misty.Set("timeBetweenHandMotion",getRandomInt(5, 10));
	misty.MoveArmPosition("left", getRandomInt(0, 7), getRandomInt(50, 100));
	misty.MoveArmPosition("right", getRandomInt(0, 7), getRandomInt(50, 100));
}

//-------------------------Look Around-----------------------------------------------------

function look_around(){
	if (misty.Get("pastState") != "lookAround"){
		misty.Set("pastState", "lookAround");
		purple_up();
	}
	misty.Debug("LOOKING AROUND");
    misty.Set("lookStartTime",(new Date()).toUTCString());
    misty.Set("timeInLook",getRandomInt(5, 10));
    misty.MoveHeadPosition(gaussianRandom(-5,5), gaussianRandom(-5,5), gaussianRandom(-5,5), 100);
}

//--------------------------LED Gradients----------------------------------------------------

function green_up(){
	//PurpleDown
	if (!misty.Get("loop1")){
		for (var i = 10; i >=0 ; i=i-1) { 
			misty.ChangeLED(Math.floor(i*14.8),0,Math.floor(i*21.1));
			misty.Pause(50);
		}
	} else {
		misty.Set("loop1", false);
	}
	//GrreenUp
	for (var i =0; i <=10 ; i=i+1) { 
		misty.ChangeLED(0,Math.floor(i*20),0);
		misty.Pause(50);
	}
}

function purple_up(){
	//GreenDown
	if (!misty.Get("loop1")){
		for (var i =10; i >=0 ; i=i-1) { 
			misty.ChangeLED(0,Math.floor(i*20),0);
			misty.Pause(50);
		}
	} else{
		misty.Set("loop1", false);
	}
	//PurpleUp
	for (var i = 0; i <=10 ; i=i+1) { 
		misty.ChangeLED(Math.floor(i*14.8),0,Math.floor(i*21.1));
		misty.Pause(100);
	}
    
}
 
// ------------------------Loop----------------------------------------------------------

while (true) {
	misty.Pause(100);

    if (secondsPast(misty.Get("blinkStartTime")) > misty.Get("timeBetweenBlink")){
        blink_now();
	}

	//misty.Set("handsStartTime",(new Date()).toUTCString());
	//misty.Set("timeBetweenHandMotion",5);
	if (secondsPast(misty.Get("handsStartTime")) > misty.Get("timeBetweenHandMotion")){
        move_hands();
	}

	if (!misty.Get("lookAround") && secondsPast(misty.Get("faceDetectedAt")) > 10.0){
		misty.Set("lookAround", true);
	}

	if (misty.Get("lookAround") && !misty.Get("inTouch")){
		if (secondsPast(misty.Get("lookStartTime")) > misty.Get("timeInLook")){
			look_around();
		}
	}

	if (misty.Get("inTouch") && secondsPast(misty.Get("touchAt")) > misty.Get("touchTimeout")){
		misty.Set("inTouch", false);
		misty.Set("eyeMemory", "Homeostasis.png");
		misty.SetHeadPosition("roll", 0, 100);
		registerFaceFollow();
	}
	
}

// -----------------------Support Functions------------------------------------------------

function secondsPast(value){
	var timeElapsed = new Date() - new Date(value);
    timeElapsed /= 1000;
    return Math.round(timeElapsed); // seconds
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gaussianRand() {
    var u = 0.0, v = 0.0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random() ; //(max - min + 1)) + min
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}

function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}

function map (num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
