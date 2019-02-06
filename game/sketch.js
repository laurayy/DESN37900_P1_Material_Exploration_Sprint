// Declare a "SerialPort" object
var serial;
var latestData = "waiting for data"; // you'll use this to write incoming data to the canvas

var bgImg, img2, sharkImg, welcomeImg;
var imgX = 0;
var imgY = 0;
var fish;
var sharks = [];
var m = 0;
var fontsize = 80;
var gameStart = false;
var gameOver = false;
var trans = 100;
var health = 5;


function preload() {
	// load image
	bgImg = loadImage("bg.png");
	img2 = loadImage("fish.png");
	trapImg = loadImage("shark.png");
	welcomeImg = loadImage("welcome.jpg");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	textSize(fontsize);
	textAlign(CENTER, CENTER);
	fish = new fish();

	sharks.push(new shark());

	// Instantiate our SerialPort object and SpeechRec
	serial = new p5.SerialPort();

	// Get a list the ports available
	// You should have a callback defined to see the results
	serial.list();

	// Assuming our Arduino is connected, let's open the connection to it
	// Change this to the name of your arduino's serial port
	serial.open("/dev/cu.usbmodem1421");

	// Here are the callbacks that you can register

	// When we connect to the underlying server
	serial.on('connected', serverConnected);

	// When we get a list of serial ports that are available
	serial.on('list', gotList);
	// OR
	//serial.onList(gotList);

	// When we some data from the serial port
	serial.on('data', gotData);
	// OR
	//serial.onData(gotData);

	// When or if we get an error
	serial.on('error', gotError);
	// OR
	//serial.onError(gotError);

	// When our serial port is opened and ready for read/write
	serial.on('open', gotOpen);
	// OR
	//serial.onOpen(gotOpen);

	// Callback to get the raw data, as it comes in for handling yourself
	//serial.on('rawdata', gotRawData);
	// OR
	//serial.onRawData(gotRawData);
}

// We are connected and ready to go
function serverConnected() {
	println("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
	println("List of Serial Ports:");
	// theList is an array of their names
	for (var i = 0; i < thelist.length; i++) {
		// Display in the console
		println(i + " " + thelist[i]);
	}
}

// Connected to our serial device
function gotOpen() {
	println("Serial Port is Open");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
	println(theerror);
}

// There is data available to work with from the serial port
function gotData() {
	var currentString = serial.readLine(); // read the incoming string
	trim(currentString); // remove any trailing whitespace
	if (!currentString) return; // if the string is empty, do no more
	//console.log(currentString);             // println the string
	latestData = currentString; // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
	println("gotRawData" + thedata);
}

//////////////////////////////////////////////DRAW///////////////////////////////////////////////////

function draw() {
	background(0);
	//fill(255, 255, 255, trans);
	//text("Sound is Not Detected", width/2, height/2);
	image(welcomeImg, imgX, imgY, windowWidth, windowHeight);


	if (gameOver) {
		background(0);
		fill(255, 255, 255, trans);
		text("Your fish is Dead", width / 2, height / 2);
	}

	game();
	if (gameStart && !gameOver) {
		image(bgImg, imgX, imgY, windowWidth, windowHeight);
		image(bgImg, imgX + windowWidth, imgY, windowWidth, windowHeight);

		for (var i = sharks.length - 1; i >= 0; i--) {
			sharks[i].show();
			sharks[i].update();

			if (sharks[i].hits(fish)) {
				//console,log("HIT");
				gameStart = false;
				gameOver = true;
			}

			if (sharks[i].offscreen()) {
				sharks.splice(i, 1);
			}
		}

		fish.show();
		fish.update();

		if (frameCount % 90 == 0) {
			sharks.push(new shark());
			m += 1;
		}

		// background movement
		imgX -= 5;
		if (imgX <= -windowWidth) {
			imgX = 0;
		}
	}
}

function game() {
	if (latestData > 300) {
		gameStart = true;
	}
}


///////////////////////KeyPressed////////////////////////////
function keyPressed() {
	if (key === ' ') {
		gameStart = true;
	}

	if (keyCode === UP_ARROW) {
		if (fish.y != height / 2 - 300) {
			fish.up();
		}
	}

	if (keyCode === DOWN_ARROW) {
		if (fish.y != height / 2 + 300) {
			fish.down();
		}
	}
}

///////////////////////////////////////////////////
function fish() {
	var initalpositionX = 250;
	var midLane = height / 2 + 230;
	this.y = midLane;
	this.x = initalpositionX;
	this.velocity = 0;

	this.show = function () {
		fill(255);
		//ellipse(this.x, this.y, 32, 32);
		image(img2, this.x - 40, this.y - 40, 180, 100);
	}

	this.up = function () {
		if (fish.y != midLane - 150) {
			this.y -= 150;
			this.x += 50;

		}
	}

	this.down = function () {
		if (fish.y != midLane + 150) {
			this.y += 150;
			this.x += 50;
		}
	}

	this.update = function () {
		if (this.x >= initalpositionX) {
			this.x -= 4;
		}
	}
}
//////////////////////////////////////////////////
function shark() {
	this.y = generate(floor(random(4)));
	this.x = width;
	this.speed = 5;
	this.highlight = false;

	this.hits = function (fish) {
		if (fish.y == this.y) {
			if (fish.x > this.x - 30 && fish.x < this.x + 30) {
				this.highlight = true;
				return true;
			}
		}
		return false;
	}

	this.show = function () {
		//fill(0);
		/*if(this.highlight) {
		    fill(255, 0, 0);
		}*/
		//ellipse(this.x, this.y, 100, 100);

		image(trapImg, this.x - 90, this.y - 60, 200, 140);
	}

	this.update = function () {
		this.x -= this.speed * 2;
	}

	this.offscreen = function () {
		if (this.x < -100) {
			return true;
		} else {
			return false;
		}
	}

	function generate(x) {
		var mid = height / 2 + 230;
		if (x <= 1) {
			return mid - 150;
		} else if (x == 2) {
			return mid;
		} else if (x >= 3) {
			return mid + 150;
		}
	}
}
