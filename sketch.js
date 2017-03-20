var playerObj;
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
	playerObj = new Player(); //add invincibility frames to each player upon loading in
	gameState = new Game();
	gameState.playerList.push(playerObj);
	rectMode(CORNER);
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

	for (var i = 0; i < gameState.particles.length; i++) {
		gameState.particles[i].y -= 5;
		gameState.particles[i].display();
	}


	// spoof collision:
	// if the particle has reached close to -150
	// make an invisible particle
	// if that particle collides with the rect
	// then declare collision
	rotate(radians(gameState.deg)); //note that this can be pushed easily to the server
	for (var i = 0; i < gameState.playerList.length; i++) {
		for (var j = 0; j < gameState.particles.length; j++) {
			// if (radians(gameState.deg) >= (gameState.particles[j].deg-0.5) && radians(gameState.deg) <= (gameState.particles[j].deg+0.5)) {
			// 	hit = collideRectCircle(gameState.playerList[i].x,gameState.playerList[i].y - 150,gameState.playerList[i].sizeX,gameState.playerList[i].sizeY,gameState.particles[j].x,gameState.particles[j].y,gameState.particles[j].size);
			// 	if (hit) console.log('collision');
			// }
		}
		gameState.playerList[i].display();
	}
}

function keyPressed() {
	if (keyCode === 32) {
		particleNew = new Particle(playerObj.x+25, playerObj.y + 150, gameState.deg);
		gameState.particles.push(particleNew);
	}
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

function Player()
{
	this.x = 0;
	this.y = 0;
	this.sizeX = 50;
	this.sizeY = 15;
	this.color = "blue";
	this.lives = 3;
	this.points = 0;

	this.display = function()
	{
		translate(0, 160);
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

function Particle(x, y, deg)
{
	this.color = "red";
	this.x = x;
	this.y = y;
	this.size = 10;
	this.deg = radians(deg);
	this.display = function()
	{
		fill(this.color);
		push();
		rotate(this.deg);
		ellipse(this.x, this.y, this.size, this.size);
		pop();
	}
}

function Game() {
	this.deg = 0;
	this.particles = [];
	this.playerList = [];
}