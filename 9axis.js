/*
	sensorTag Accelerometer example

	This example uses Sandeep Mistry's sensortag library for node.js to
	read data from a TI sensorTag.

	Although the sensortag library functions are all asynchronous,
	there is a sequence you need to follow in order to successfully
	read a tag:
		1) discover the tag
		2) connect to and set up the tag
		3) turn on the sensor you want to use (in this case, accelerometer)
		4) turn on notifications for the sensor
		5) listen for changes from the sensortag

	This example does all of those steps in sequence by having each function
	call the next as a callback. Discover calls connectAndSetUp, and so forth.

	This example is heavily indebted to Sandeep's test for the library, but
	achieves more or less the same thing without using the async library.

	created 15 Jan 2014
	by Tom Igoe
	
	
	Since been edited to properly fit the digital-gym team project. Added code to send live raw data to server.
	
	07/15/2016 
	James Grinage & Connor Heggie
	Rice Univeristy, 2018
*/



var request = require('request');			//allows http requests to be sent
var SensorTag = require('sensortag');		// sensortag library
const WINDOW_SAMPLE_NUM = 5;				//constant for the window size that buffer will store before sending data

// listen for tags:
SensorTag.discover(function(tag) {			//on discovery the function defined inside the parentheses (a callback) will be run
	var accelbuffer = {};						//semi-global variable (the scope is anything within this function)
	var gyrobuffer = {};
											//acts as a buffer to store data before being sent
	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {		//event listener for the disconnect event
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
	 	console.log('connectAndSetUp');
	 	tag.connectAndSetUp(enableNineAxis);		// when you connect and device is setup, call enableAccelMe
  	 	//tag.connectAndSetUp(enableGyro);
  	 }

   	function enableNineAxis() {		// attempt to enable the accelerometer
	 	console.log('enableAccelerometer'); // when you enable the accelerometer, start accelerometer notifications:
	 	tag.enableAccelerometer(notifyMe);
	 	console.log('enableGyroscope');     
	 	tag.enableGyroscope(notifyMe);      // enables listen for Gyroscsope
	 	console.log('enableMagentometer');
	 	tag.enableMagnetometer(notifyMe);   // enables listen for Magnetometer
   	}

	function notifyMe() {
	    tag.notifyAccelerometer(listenForAcc);   	// start the accelerometer listener
	    tag.notifyGyroscope(listenforGyro);         // start the gyroscope listener
	    tag.notifyMagnetometer(listenforMag);       // start the magnetometer listener
		tag.notifySimpleKey(listenForButton);		// start the button listener
   	}

   // When you get an accelermeter change, print it out:
	function listenForAcc() {
		tag.on('accelerometerChange', function(x, y, z) {
			console.log("Accel Change");
			//add to global buffer use timestamp
			var time = Math.floor(Date.now() - 1468472410000);  //milliseconds from midnight
			accelbuffer[String(time)] = [x, y, z];
			//post request async
			if(Object.keys(accelbuffer).length >= WINDOW_SAMPLE_NUM){
				//need to deep copy the buffer and then pass it in to avoid problems with
				console.log("Inside Accel If");
				var newBuff = accelbuffer;
				accelbuffer = {};
				sendData(newBuff);
			}
		});
	}

	function listenforGyro() {
		tag.on('gyroscopeChange', function(xG, yG, zG) {
			console.log("Gyro Change");
			//add to global buffer use timestamp
			var time = Math.floor(Date.now() - 1468472410000);  //milliseconds from midnight
			gyrobuffer[String(time)] = [xG, yG, zG];
			//post request async
			if(Object.keys(gyrobuffer).length >= WINDOW_SAMPLE_NUM){
				//need to deep copy the buffer and then pass it in to avoid problems with
				console.log("Inside Gyro If");
				var newBuff = gyrobuffer;
				gyrobuffer = {};
				sendData(newBuff);
			}
		});
	}

	function listenforMag() {
	    tag.on('magnetometerChange', function (xM, yM, zM) {
	        console.log("Magnet Change");
	        //add to global buffer use timestamp
	        var time = Math.floor(Date.now() - 1468472410000);  //milliseconds from midnight
	        gyrobuffer[String(time)] = [xM, yM, zM];
	        //post request async
	        if (Object.keys(gyrobuffer).length >= WINDOW_SAMPLE_NUM) {
	            //need to deep copy the buffer and then pass it in to avoid problems with
	            console.log("Inside Magnet If");
	            var newBuff = gyrobuffer;
	            gyrobuffer = {};
	            sendData(newBuff);
	        }
	    });
	}


	function sendData(buff){  //post request
		request.post({"url": 'http://node-red-input-tester.mybluemix.net/bike-data/', 'json': buff});	//fix this to include form data (aka just any data in general)
	}

	// when you get a button change, print it out:
	function listenForButton() {
		tag.on('simpleKeyChange', function(left, right) {
			if (left) {
				console.log('left: ' + left);
			}
			if (right) {
				console.log('right: ' + right);
			}
			// if both buttons are pressed, disconnect:
			if (left && right) {
				tag.disconnect();
			}
	   });
	}

	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});
