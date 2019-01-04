/*
*    Copyright 2018 Misty Robotics, Inc.
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

misty.Debug("Intruder alert skill started");

misty.Debug("Centering Head");
misty.MoveHeadPosition(-5, 0, 0, 100);
misty.MoveArmPosition("left", 0, 45);
misty.MoveArmPosition("right", 0, 45);

misty.Set("StartTime",(new Date()).toUTCString());
misty.Set("Initiated",false);
misty.Set("falseAlarm", 0);
misty.ChangeDisplayImage("Homeostasis.png");

misty.Set("red", 148);
misty.Set("green", 0);
misty.Set("blue", 211);
misty.ChangeLED(148, 0, 211);

flags_on();

misty.StartFaceRecognition();
// registerFaceRec();
registerBumpSensors();


// ------------------------------------------Intruder Check-----------------------------------------------------

function _FaceRec(data){
    //misty.Debug("IN");
    try{
        //misty.Debug(data.PropertyTestResults[0].PropertyParent.Distance);
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
                    misty.Set("StartTime",(new Date()).toUTCString());   
                    misty.Set("Initiated",true);
                    misty.Set("eyeMemory", "Disdainful.png");
                    blink_now();    
                    misty.PlayAudioClip("hey.wav",0,500);
                    misty.PlayAudioClip("aystbh.wav",0,1000);
                    //misty.Set("aystbh", false);
                    misty.Pause(1000);
                    misty.Debug("Intruder Detected !!");
                    red_up();
                    misty.TakePicture(false, "Intruder", 1200, 1600, false, true);
                    misty.MoveArmPosition("left", 6, 45);
                    misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/switch_intruder_on/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/blink_intruder/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    //misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/text_intruder/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://7jzrmzmsr5.execute-api.us-west-1.amazonaws.com/default/cp_python_learn_fn_name",null,null,null,"{}");
                    misty.SendExternalRequest("POST", "https://dweet.io/dweet/for/misty",null,null,null,"{\"status\":\"Intruder_Alarrm_On\"}");
                    
                    
                    misty.Set("falseAlarm", 0);
                    
                    // pitch, roll, yaw
                    misty.PlayAudioClip("intruder.wav");
                    
                    misty.MoveHeadPosition(-5, -3, -2, 100,0,2000);
                    misty.PlayAudioClip("intruder.wav");
                    
                    misty.MoveHeadPosition(-5, 3, 2, 100,0,2000);
                    misty.PlayAudioClip("intruder.wav");
                    
                    misty.MoveHeadPosition(-5, 0, 0, 100,0,2000);
                    misty.PlayAudioClip("ybln.wav");

                    // Register Bump Sensors
                    registerBumpSensors();
                    
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
    misty.Debug("BUMP PRESSED");
    var sensor = data.AdditionalResults[0];
    misty.Debug(sensor);

    if (sensor == "Bump_RearRight" || sensor == "Bump_RearLeft"){
        
        misty.MoveHeadPosition(-5, 0, 0, 100);
        misty.MoveArmPosition("left", 0, 45);
        misty.MoveArmPosition("right", 0, 45);
        
        misty.Set("eyeMemory", "Homeostasis.png");
        flags_on();
        misty.SendExternalRequest("POST", "https://maker.ifttt.com/trigger/switch_intruder_off/with/key/cfconLr0jZT4qT6mTRKImX",null,null,null,"{}");
        misty.Set("Initiated",false);
        green_up();
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

// ------------------------------------------LED changes-------------------------------------------------

function green_up(){

    var red = misty.Get("red")/10.0;
    var green = misty.Get("green")/10.0;
    var blue = misty.Get("blue")/10.0;
    for (var i = 10; i >=0 ; i=i-1) { 
        misty.ChangeLED(Math.floor(i*red),Math.floor(i*green),Math.floor(i*blue));
        misty.Pause(50);
    }
    for (var i =0; i <=10 ; i=i+1) { 
		misty.ChangeLED(0,Math.floor(i*20),0);
		misty.Pause(50);
    }
    misty.Set("red", 0);
    misty.Set("green", 200);
    misty.Set("blue", 0);
    
}

function red_up(){
    var red = misty.Get("red")/10.0;
    var green = misty.Get("green")/10.0;
    var blue = misty.Get("blue")/10.0;
    for (var i = 10; i >=0 ; i=i-1) { 
        misty.ChangeLED(Math.floor(i*red),Math.floor(i*green),Math.floor(i*blue));
        misty.Pause(50);
    }
    for (var i =0; i <=10 ; i=i+1) { 
		misty.ChangeLED(Math.floor(i*20),0,0);
		misty.Pause(50);
    }
    misty.Set("red", 200);
    misty.Set("green", 0);
    misty.Set("blue", 0);
}

function purple_up(){
    var red = misty.Get("red")/10.0;
    var green = misty.Get("green")/10.0;
    var blue = misty.Get("blue")/10.0;
    for (var i = 10; i >=0 ; i=i-1) { 
        misty.ChangeLED(Math.floor(i*red),Math.floor(i*green),Math.floor(i*blue));
        misty.Pause(50);
    }
    for (var i =0; i <=10 ; i=i+1) { 
		misty.ChangeLED(Math.floor(i*14.8),0,Math.floor(i*21.1));
		misty.Pause(50);
    }
    misty.Set("red", 148);
    misty.Set("green", 0);
    misty.Set("blue", 211);

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
            misty.Set("Initiated",false);
            purple_up();
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
    misty.RegisterEvent("Bumped", "BumpSensor", 250 ,true);
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