function Activate() {
	misty.Debug("Starting Read/Write Uart skill #2!!");
	misty.AddReturnProperty("StringMessage", "StringMessage");
	misty.RegisterEvent("StringMessage", "ReadBackPackUart_Callback", "StringMessage", 0, true);
	misty.Set("cold_detected", "false");
	misty.Set("hot_detected", "false");
	misty.Set("in_action","false");

	// misty.WriteBackpackUart("Hello CP");
}

function Deactivate() {
	misty.UnregisterEvent("StringMessage");
}

function ReadBackPackUart_Callback() {	
	var data = misty.GetEventData("StringMessage");
	
	try{
		if(data !== undefined && data !== null && misty.Get("in_action")=="false") {
			var parsedData = JSON.parse(data);
			var obj = JSON.parse(parsedData.AdditionalResults[0].Message);

			var delta = obj.temp_change;

			misty.Debug(delta);

			if (delta > 0.1 && misty.Get("hot_detected")=="false"){
				hot_sequence();
			}

			if (delta < -0.1 && misty.Get("cold_detected")=="false"){
				cold_sequence();
			}

			if (misty.Get("cold_detected")=="true" && misty.Get("hot_detected")=="true"){
				swap_sequence();
			}
		}
	}
	catch(exception) {
		misty.Debug("Exception" + JSON.stringify(exception));
	}
	//misty.WriteBackpackUart(message);
}

function cold_sequence(){
	misty.UnregisterEvent("StringMessage");
	misty.Debug("Cold_sequence_initiated !!");
	misty.Set("in_action","true");
	misty.Set("cold_detected","true");
	misty.ChangeDisplayImage("cold_image.jpg");
	misty.PlayAudioClip("cold_song.wav");
	misty.Pause(30000);
	misty.ChangeDisplayImage("Content.jpg");
	misty.Set("in_action", "false");
	misty.AddReturnProperty("StringMessage", "StringMessage");
	misty.RegisterEvent("StringMessage", "ReadBackPackUart_Callback", "StringMessage", 0, true);
}

function hot_sequence(){
	misty.UnregisterEvent("StringMessage");
	misty.Debug("Hot_sequence_initiated");
	misty.Set("in_action","true");
	misty.Set("hot_detected","true");
	misty.PlayAudioClip("hot_song.wav");

	for (i = 0; i < 2; i++) {
		misty.ChangeDisplayImage("hot_image.jpg");
		misty.Pause(300);
		misty.ChangeDisplayImage("Content.jpg");
		misty.Pause(500);
	}
	misty.ChangeDisplayImage("hot_image.jpg");
	misty.Pause(13400);
	misty.Set("in_action", "false");
	misty.ChangeDisplayImage("Content.jpg");
	misty.AddReturnProperty("StringMessage", "StringMessage");
	misty.RegisterEvent("StringMessage", "ReadBackPackUart_Callback", "StringMessage", 0, true);
}

function swap_sequence(){
	misty.UnregisterEvent("StringMessage");
	misty.Debug("Swap_sequence_initiated");
	misty.Set("cold_detected", "false");
	misty.Set("hot_detected", "false");
	misty.Set("in_action","true");
	misty.PlayAudioClip("hot_and_cold_song.wav");
	for (i = 0; i < 21; i++) {
		misty.ChangeDisplayImage("Angry.jpg");
		misty.Pause(200);
		misty.ChangeDisplayImage("Content.jpg");
		misty.Pause(300);
	}
	misty.Set("in_action", "false");
	misty.AddReturnProperty("StringMessage", "StringMessage");
	misty.RegisterEvent("StringMessage", "ReadBackPackUart_Callback", "StringMessage", 0, true);
}