
var request = require('request');			//allows http requests to be sent
var SensorTag = require('sensortag');		// sensortag library
const WINDOW_SAMPLE_NUM = 80;				// sends data every 

// listen for tags:
SensorTag.discover(function(tag) {			//on discovery the function defined inside the parentheses (a callback) will be run
	var buffer = {};
											//acts as a buffer to store data before being sent
	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {		//event listener for the disconnect event
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
	 	console.log('connectAndSetUp');
	 	tag.connectAndSetUp(enableLux);		// when you connect and device is setup, call enableLux
  	 }

   	function enableLux() {		// attempt to enable luxometer
   		console.log('Inside Enable Lux');
	 	tag.enableLuxometer(dataRate);	//enables the luxometer
   	}

   	function dataRate() {
   		console.log('inside Data Rate');
   		tag.setSamplingRate(25, ReadLux);
   	}

	/*function notifyMe() {
	    	console.log("inside NotifyMe");
	    	tag.notifyLuxometer(LuxChange);   	// start the lux listener
   	}*/

   	function ReadLux(){                        // most of the lux code goes within this section. still figuring out some details
   		tag.readLuxometer();
   		console.log('data');
   
   	}

	/*function sendData(buff){  //post request
		request.post({"url": 'http://routing-processing-flask.azurewebsites.net/bike-data/117', 'json': buff});	//fix this to include form data (aka just any data in general)
		console.log('data sent');
	}*/


	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});
