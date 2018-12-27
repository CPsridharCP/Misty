misty.Debug("Intruder alert skill started");

misty.MoveHeadPosition(0, 0, 0, 100);

misty.Set("StartTime",(new Date()).toUTCString());
misty.Set("Initiated",false);
misty.Set("falseAlarm", 0);
misty.ChangeDisplayImage("Homeostasis.png");

flags_on();

misty.StartFaceRecognition();
registerFaceRec();


// ------------------------------------------Intruder Check-----------------------------------------------------

function _FaceRec(data){
    //misty.Debug("IN");
    try{
        misty.Debug(data.PropertyTestResults[0].PropertyParent.Distance);
        if (data.PropertyTestResults[0].PropertyParent.Distance < 180){

            // if (misty.Get("hey")){
            //     misty.PlayAudioClip("hey.wav",0,1000);
            //     misty.Set("hey", false);
            // }

            if (data.PropertyTestResults[0].PropertyValue == "unknown person"){
                var count = misty.Get("falseAlarm");
                misty.Set("falseAlarm",count+1);
                misty.Debug("FalseAlarm_Avoided");
                if (misty.Get("falseAlarm")>3){ 
                    misty.UnregisterEvent("FaceRec");       
                    misty.PlayAudioClip("hey.wav",0,500);
                    misty.PlayAudioClip("aystbh.wav",0,1000);
                    //misty.Set("aystbh", false);
                    misty.Pause(1000);
                    misty.Debug("Intruder Detected !!");
                    misty.TakePicture(false, "Intruder", 1200, 1600, false, true);
                    misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/blink_intruder/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    //misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/text_intruder/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://7jzrmzmsr5.execute-api.us-west-1.amazonaws.com/default/cp_python_learn_fn_name",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/switch_intruder_on/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://dweet.io/dweet/for/misty",null,null,null,"{\"status\":\"Intruder_Alarrm_On\"}");
                    misty.Set("StartTime",(new Date()).toUTCString());
                    misty.Set("Initiated",true);
                    misty.Set("eyeMemory", "Disdainful.png");
                    blink_now();
                    misty.Set("falseAlarm", 0);

                    // Register Bump Sensors
                    registerBumpSensors();

                    // Raise Red LED

                }
            } else {
                
                var name = data.PropertyTestResults[0].PropertyValue;
                misty.Debug(name);
                misty.Set("falseAlarm", 0);
                switch(name) {
                    case "CP":
                        if (misty.Get("CP")){
                            misty.UnregisterEvent("FaceRec");
                            misty.Set("CP",false);
                            misty.PlayAudioClip("hi_CP.wav",1500,0);
                            misty.PlayAudioClip("gtcu.wav",0,1500);
                            registerFaceRec();
                        }
                        break;
                    case "IAN":
                        if (misty.Get("IAN")){
                            misty.UnregisterEvent("FaceRec");
                            misty.Set("IAN",false);
                            misty.PlayAudioClip("hi_IAN.wav",1500,0);
                            misty.PlayAudioClip("gtcu.wav",0,1500);
                            registerFaceRec();
                        }
                        break;
                    default:
                        if (misty.Get("gtcu")){
                            misty.PlayAudioClip("gtcu.wav");
                            misty.Set("gtcu",false);
                        }
                }
            }

        } else {
            // When Face Detected far away
        }
    
    } catch (err) {
        misty.Debug("Some Error: "+ err);
    }
}

// ------------------------------------------BumpSensors------------------------------------------------

function _Bumped(data) {

    misty.UnregisterEvent("Bumped");
    
    var sensor = data.AdditionalResults[0];
    misty.Debug(sensor);

    if (sensor == "Bump_RearRight" || sensor == "Bump_RearLeft"){
        
        misty.Set("eyeMemory", "Homeostasis.png");
        flags_on();
        misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/switch_intruder_off/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
        misty.Set("Initiated",false);
        misty.Set("StartTime",(new Date()).toUTCString());
        registerFaceRec();

    } else {
        registerBumpSensors();
    }

 }

// ------------------------------------------Blink-----------------------------------------------------

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

// ------------------------------------------Loop-----------------------------------------------------

while (true) {
    
    if (misty.Get("Initiated")){
        var timeElapsed = new Date() - new Date(misty.Get("StartTime"));
        timeElapsed /= 1000;
        var secondsElapsed = Math.round(timeElapsed);
        // misty.Debug(secondsElapsed);
        if (secondsElapsed >= 30){
            misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/switch_intruder_off/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
            misty.Set("eyeMemory", "Homeostasis.png");
            //misty.ChangeDisplayImage("Homeostasis.png");
        } 
    } else {}
    misty.Pause(50);
    if (secondsPast(misty.Get("blinkStartTime")) > misty.Get("timeBetweenBlink")){
        blink_now();
	}
}

// ------------------------------------------Supporting Functions-----------------------------------------------------

function secondsPast(value){
	var timeElapsed = new Date() - new Date(value);
    timeElapsed /= 1000;
    return Math.round(timeElapsed); // seconds
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function registerFaceRec(){
    misty.AddPropertyTest("FaceRec", "PersonName", "exists", "", "string");
    misty.RegisterEvent("FaceRec", "ComputerVision", 1000, true);
}

function registerBumpSensors(){
    misty.AddReturnProperty("Bumped", "sensorName",);
    misty.RegisterEvent("Bumped", "BumpSensor", 0 ,true);
}

function _SendExternalRequest(data_response) {
    misty.Debug(JSON.stringify(data_response));
}

function flags_on(){
    misty.Set("hey", true);
    //misty.Set("aystbh",true);
    misty.Set("CP", true);
    misty.Set("IAN", true);
    misty.Set("gtcu",true);
}