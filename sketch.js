var playerObj, vertDist;
var particles = [];
var counter1 = 0;
var counter2 = 1;
var difficulty = 40;
var hit = false;
var colorCounter = 0;
var clearer = true;
var polyRad = 200;
var polyPoints = 8;
var angle = 6.283185307179586/polyPoints;
// 153.07337294603593

function setup() {
	var myCanvas = createCanvas(600, 400);
	myCanvas.parent("canvas");
	frameRate(30);
	for (var i = 0; i < difficulty; i++) particles.push(new Particle(ColorID(randomWholeNum(3))));
	playerObj = new Player(polyRad, polyPoints);
	gameState = new Game();
}

function randomWholeNum(range) {
	return Math.floor(Math.random() * range);
}


function recursePoly(x, y, theta)
{
	if (theta >= 6.283185307179586) return;
	var a = cos(theta+angle)*polyRad;
	var b = sin(theta+angle)*polyRad;
	recursePoly(a, b, theta+angle);
	// vertDist = dist(x, y, a, b);
	// stroke(100);
	// var m = (b-y)/(a-x);
	// var xPrime = -m*(b-y-(x/m));
	// line(x, y, xPrime, b);
	stroke(255);
	return line(x, y, a, b);
}

function draw() 
{
	translate(width/2, height/2);
	var hit;
	var hitCounter = 0;
	background('black');

	if (keyIsDown(LEFT_ARROW)) {
		gameState.deg += 5;
	}

	if (keyIsDown(RIGHT_ARROW)) {
		gameState.deg -= 5;
	}

	var x = recursePoly(cos(0)*polyRad, sin(0)*polyRad, 0);

	rotate(radians(gameState.deg)); //note that this can be pushed easily to the server
	playerObj.display();
}


function ColorID(integer)
{
	switch(integer){
		case 0: return "white";
		case 1: return "green";
		case 2: return "red";

		default: return "black";
	}
}

function Player(r, n)
{
	var angle = 6.283185307179586/n;
	this.x = 0;
	this.y = 0;
	this.sizeX = 50;
	this.sizeY = 25;
	this.color = "blue";
	this.lives = 3;
	this.points = 0;

	this.display = function()
	{
		translate(0, 150);
		fill(this.color);
		rect(this.x, this.y, this.sizeX, this.sizeY);
	}

	this.interaction = function(color)
	{
		if (color == "red") this.lives--;
		else if (color == "green") {
			this.points += 100;
		} else this.points += 10;
	}
}

function Particle(color)
{
	this.color = color;
	this.x = randomWholeNum(width);
	this.y = 0;
	this.size = 20;

	this.display = function()
	{
		fill(this.color);
		ellipse(this.x, this.y, this.size, this.size);
	}
}

function Game() {
	this.deg = 0;
}