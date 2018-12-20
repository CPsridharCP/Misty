
misty.Debug("Starting Fire Security!!");

misty.AddReturnProperty("StringMessage", "StringMessage");
misty.RegisterEvent("StringMessage", "StringMessage", 0, true);

misty.Set("StartTime",(new Date()).toUTCString());
misty.Set("alarm",false);

misty.Set("past", 0.0);
misty.Set("slope_down_count",0);
misty.Set("slope_up_count",0);
misty.Set("wait_to_threshold", true);

function _StringMessage(data) {	
	
	try{

		if(data !== undefined && data !== null) {

			var obj = JSON.parse(data.AdditionalResults[0].Message);
			var temp    = obj.temperature;
			let threshold = 26.0;
			var alarm = 0;

			if (misty.Get("wait_to_threshold")){

				if (temp < threshold){
					misty.Set("wait_to_threshold", false);
				} else {
					if (temp - misty.Get("past") > 0.0){
						var slope_up_count_increment = 1+ misty.Get("slope_up_count");
						misty.Set("slope_up_count",slope_up_count_increment);
					} else {
						misty.Set("slope_up_count",0);
					}
					if (misty.Get("slope_up_count") >= 5){
						misty.Set("slope_up_count",0);
						misty.Set("wait_to_threshold", false);
					}
				}
			}

			if (temp>threshold && !misty.Get("wait_to_threshold")){
	
				alarm = 1;

				if (misty.Get("alarm")){

					// While in alarm, if temp drops down 5 times stop alarm and wait to go below threshold
					if (temp - misty.Get("past") < 0.0 ){
						var slope_down_count_increment = 1+ misty.Get("slope_down_count");
						misty.Set("slope_down_count",slope_down_count_increment);
					} else {
						misty.Set("slope_down_count",0);
					}

					if (misty.Get("slope_down_count") >= 5){
						misty.Set("alarm", false);
						misty.Set("slope_down_count",0);
						misty.Set("wait_to_threshold", true);
						misty.Set("StartTime",(new Date()).toUTCString());
					}

					// Replay Audio after end of clip
					var timeElapsed = new Date() - new Date(misty.Get("StartTime"));
					timeElapsed /= 1000;
					var secondsElapsed = Math.round(timeElapsed);
					if (secondsElapsed>7.0){
						misty.Set("StartTime",(new Date()).toUTCString());
						misty.PlayAudioClip("alarm.wav");
					}
				} else {
					misty.Set("alarm", true);
					misty.PlayAudioClip("alarm.wav");
					misty.Set("StartTime",(new Date()).toUTCString());
				}

			} else {
				misty.Set("alarm",false);
			}

			misty.SendExternalRequest("POST", "https://dweet.io/dweet/for/misty-fire-security",null,null,null,"{\"temperature\":"+temp.toString()+",\"alarm\":"+alarm.toString()+"}");
			misty.Debug(temp);

			misty.Set("past", temp);

		}
	}
	catch(exception) {
		misty.Debug("Exception" + JSON.stringify(exception));
	}
	//misty.WriteBackpackUart(message);
}

while (true) {
    misty.Pause(50);
}

function map (num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
