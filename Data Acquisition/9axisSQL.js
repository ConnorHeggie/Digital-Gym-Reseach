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



//var request = require('request');			//allows http requests to be sent
var SensorTag = require('sensortag');		// sensortag library
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var config = {
	user: 'Rice.Sensor',
	password: 'Ashu1234!',
	server: 'digitalgym.database.windows.net',
    options: {encrypt: true, database: 'AdventureWorks'}
    };

const WINDOW_SAMPLE_NUM = 40;				//constant for the window size that buffer will store before sending data
const idNum = 117;							//ID number for a given exercise bike



// listen for tags:
SensorTag.discover(function(tag) {			//on discovery the function defined inside the parentheses (a callback) will be run
											//acts as a buffer to store data before being sent (nested Arrays)
	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {		//event listener for the disconnect event
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
	 	console.log('connectAndSetUp');
	 	tag.connectAndSetUp(enableAll);		// when you connect and device is setup, call enableWOM
  	 }

   	function enableAll() {		// attempt to enable everything
   		console.log('Inside Enable All');
	 	tag.enable9AxisandWOM(dataRate);	//enables the 9 axises and then calls notifyMe
   	}

   	function dataRate() {
   		console.log('inside Data Rate');
   		tag.setSamplingRate(25, startSQLconnection);
   	}

   	function startSQLconnection(){
   		var connection = new Connection(config);	//starts a connection to the SQL server
   		connection.on('connect', function(err)
   			if(err){
   				console.log(err);
   			}
   			console.log('connected');
   			notifyMe());
   	}

	function notifyMe() {
	    	console.log("inside NotifyMe");
	    	tag.notifyMPU9250(listenFor9Change);   	// start the accelerometer listener
   	}

   	function listenFor9Change(){
   		tag.on('9axisChange', function(x, y, z, xG, yG, zG, xM, yM, zM){
			//add to global buffer use timestamp
			var time = Math.floor(Date.now());  //milliseconds from January 1, 1970
			sendData(new Array(time, x, y, z, xG, yG, zG, xM, yM, zM));
   		});
   	}

	function sendData(accList){  //sends to SQL
		var request = new Request('INSERT INTO id' + str(idNum) + ' (stamp, x, y, z, xG, yG, zG, xM, yM, zM) VALUES (@stamp, @x, @y, @z, @xG, @yG, @zG, @xM, @yM, @zM)',
			function(err){
				if(err){console.log(err);}
			});
		request.addParameter('stamp', TYPES.Int, accList[0]);
		request.addParameter('x', TYPES.Int, accList[1]);
		request.addParameter('y', TYPES.Int, accList[2]);
		request.addParameter('z', TYPES.Int, accList[3]);
		request.addParameter('xG', TYPES.Int, accList[4]);
		request.addParameter('yG', TYPES.Int, accList[5]);
		request.addParameter('zG', TYPES.Int, accList[6]);
		request.addParameter('xM', TYPES.Int, accList[7]);
		request.addParameter('yM', TYPES.Int, accList[8]);
		request.addParameter('zM', TYPES.Int, accList[9]);
		connection.execSql(request);
	}

	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});