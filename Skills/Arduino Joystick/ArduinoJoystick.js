
misty.Debug("Starting Read/Write Uart skill #2!!");

misty.Set("current_image_index", 0);
misty.Set("current_audio_index", 0);

misty.AddReturnProperty("StringMessage", "StringMessage");
misty.RegisterEvent("StringMessage", "StringMessage", 0, true);


function _StringMessage(data) {	
	//misty.Debug(JSON.parse(data.AdditionalResults[0].Message).v_analog);
	
	try{
		if(data !== undefined && data !== null) {
			//var parsedData = JSON.parse(data);
			var obj = JSON.parse(data.AdditionalResults[0].Message);
			
			var up_button    = obj.up;
			var down_button  = obj.down;
			var left_button  = obj.left;
			var right_button = obj.right;

			var analog_button      = obj.b_analog;
			var analog_vertical    = obj.v_analog;
			var analog_horizontal  = obj.h_analog;

			//misty.Debug(typeof up_button);//
			misty.Drive(0,map(analog_horizontal,0,1024,-40,40));
			misty.SetHeadPosition("pitch", map(analog_vertical,0,1024,5,-5), 10);

			var images = ["Content.jpg","Angry.jpg","Confused.jpg","Groggy.jpg","Happy.jpg","Sad.jpg"];
			var audios = ["001-EeeeeeE.wav","007-Eurhura.wav","008-AhhhAhh.wav","007-Sneeze.wav","020-Whoap.wav","006-Sniffle.wav"];
			//misty.Debug(images.length);

			var now_image = parseInt(misty.Get("current_image_index"));
			var now_audio = parseInt(misty.Get("current_audio_index"));

			if (left_button == 0){	
				now_image -= 1;
				if (now_image < 0){
					now_image = images.length - 1;
				}
				misty.ChangeDisplayImage(images[now_image]);
				misty.Set("current_image_index",now_image);
			}

			if (right_button == 0){
				now_image += 1;
				if (now_image >= images.length){
					now_image = 0;
				}
				misty.ChangeDisplayImage(images[now_image]);
				misty.Set("current_image_index",now_image);
			}

			if (up_button == 0){	
				now_audio -= 1;
				if (now_audio < 0){
					now_audio = images.length - 1;
				}
				misty.PlayAudioClip(audios[now_audio]);
				misty.Set("current_audio_index",now_audio);
			}

			if (down_button == 0){
				now_audio += 1;
				if (now_audio >= images.length){
					now_audio = 0;
				}
				misty.PlayAudioClip(audios[now_audio]);
				misty.Set("current_audio_index",now_audio);
			}

			//misty.Debug("AdditionalResults:" + JSON.stringify(parsedData.AdditionalResults[0]));
			//misty.Debug("Message123:" + parsedData.AdditionalResults[0].Message);
		}
	}
	catch(exception) {
		misty.Debug("Exception" + JSON.stringify(exception));
	}

	//misty.WriteBackpackUart(message);
}

function map (num, in_min, in_max, out_min, out_max) {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
