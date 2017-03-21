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
	stroke(255);
	return line(x, y, a, b);
}

function draw() 
{
	translate(width/2, height/2);
	var hit;
	background('black');

	if (keyIsDown(LEFT_ARROW)) {
		gameState.deg += (Math.PI);
	}

	if (keyIsDown(RIGHT_ARROW)) {
		gameState.deg -= Math.PI;
	}

	push();
	var x = recursePoly(cos(0)*polyRad, sin(0)*polyRad, 0);
	pop();

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
			if (gameState.particles[j].y == -150) {

				//console.log(gameState.particles[j].opp); //this is the angle of collision
				//console.log(gameState.deg);

				var angleCollision = gameState.particles[j].opp;

				if (gameState.deg >= (angleCollision - 25) && gameState.deg <= (angleCollision + 25)) {
					console.log("collision");
				}
				// var particleX = new Particle(gameState.particles[j].x, gameState.particles[j].y, gameState.deg, "black");
				// hit = collideRectCircle(gameState.playerList[i].x,gameState.playerList[i].y,gameState.playerList[i].sizeX,gameState.playerList[i].sizeY,particleX.x,particleX.y,particleX.size);
				
				// if (hit) {
				// 	console.log("collision");
				// }
			}
		}
		gameState.playerList[i].display();
		// if (gameState.deg <= -360 || gameState.deg >= 360) gameState.deg = 0;
		if (gameState.deg <= 0) {
			gameState.deg += 360;
		} else if (gameState.deg >= 360) {
			gameState.deg -= 360;
		}
	}
}

function keyPressed() {
	if (keyCode === 32) {
		particleNew = new Particle(playerObj.x+25, playerObj.y + 150, gameState.deg, "red");
		gameState.particles.push(particleNew);
		console.log(gameState.deg);
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

var toDegree = function (radians) {
    return radians * (180 / Math.PI);
}

function Particle(x, y, deg, color)
{
	this.color = color;
	this.x = x;
	this.y = y;
	this.size = 10;
	this.deg = radians(deg);
	var anti;
	if (deg + 180 >= 360) {
		anti = deg - 180;
	} else if (deg - 180 <= 0) {
		anti = deg + 180;
	}
	this.opp = anti;
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
	this.hitCounter = 0;
}