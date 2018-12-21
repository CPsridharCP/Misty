misty.Debug("Starting Looks !!");

misty.Set("pitch", 0.0);
misty.Set("yaw", 0.0);

misty.Set("faceDetectedAt", (new Date()).toUTCString());
misty.Set("lookAround", true);
misty.Set("lookStartTime",(new Date()).toUTCString());
misty.Set("timeInLook",6.0);

misty.Debug("Centering Head");
misty.MoveHeadPosition(0, 0, 0, 100);
misty.Pause(3000);

//misty.StartFaceRecognition();
misty.StartFaceDetection();
registerFaceFollow();

function registerFaceFollow(){
	misty.AddPropertyTest("FaceFollow", "PersonName", "exists", "", "string");
	misty.RegisterEvent("FaceFollow", "ComputerVision", 400, true);
}

// -----------------------------Face Follow--------------------------------------------------------

function _FaceFollow(data){
    
    try{
		// TODO Turn off Look Around
		misty.Set("lookAround", false);

        var bearing = data.PropertyTestResults[0].PropertyParent.Bearing * 0.25 * 0.2;
		var elevation = data.PropertyTestResults[0].PropertyParent.Elevation * 0.3 * 0.2;
		
		bearing = min_increment(bearing);
		elevation = min_increment(elevation);

		var to_pitch = misty.Get("pitch"); 
		var to_yaw = misty.Get("yaw"); 
		to_pitch = set_in_range(to_pitch + elevation);
		to_yaw = set_in_range(to_yaw + bearing);

		// Avoiding Oscillations - the next two IFs
		if (Math.sign(to_pitch) == Math.sign(elevation)){
			misty.SetHeadPosition("pitch", to_pitch, 100);
		}

		if (Math.sign(to_yaw) == Math.sign(bearing)){
			misty.SetHeadPosition("yaw", to_yaw, 100);
		}

		misty.Debug(bearing+" , "+elevation);
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

	if (Math.abs(value) <= 0.2) {
		
		return 0.0;

	} else if (Math.abs(value) > 0.2){
		
		return 0.2*Math.sign(value);
	}
	
}

//-------------------------Blink--------------------------------------------------------

misty.Set("blinkStartTime",(new Date()).toUTCString());
misty.Set("timeBetweenBlink",5);

function blink_now(){
    misty.Set("blinkStartTime",(new Date()).toUTCString());
    misty.Set("timeBetweenBlink",getRandomInt(2, 8));
    misty.ChangeDisplayImage("blinkMisty.png");
    misty.Pause(300);
    misty.ChangeDisplayImage("Homeostasis.png");
}

//-------------------------Look Around-----------------------------------------------------

function look_around(){
	misty.Debug("LOOKING AROUND");
    misty.Set("lookStartTime",(new Date()).toUTCString());
    misty.Set("timeInLook",getRandomInt(5, 10));
    misty.MoveHeadPosition(gaussianRandom(-5,5), gaussianRandom(-5,5), gaussianRandom(-5,5), 100);
}

 
// ------------------------Loop----------------------------------------------------------

while (true) {
	misty.Pause(100);

    if (secondsPast(misty.Get("blinkStartTime")) > misty.Get("timeBetweenBlink")){
        blink_now();
	}

	if (!misty.Get("lookAround") && secondsPast(misty.Get("faceDetectedAt")) > 10.0){
		misty.Set("lookAround", true);
	}

	if (misty.Get("lookAround")){
		if (secondsPast(misty.Get("lookStartTime")) > misty.Get("timeInLook")){
			look_around();
		}
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
