var socket = io.connect();
var playerObj, gameState;
var hit = false;
var colorCounter = 0;
var clearer = true;
var polyRad = 200;
var polyPoints = 8;
var angle = 6.283185307179586/polyPoints;
// 153.07337294603593

function setup() {
	var myCanvas = createCanvas(600, 450);
	myCanvas.parent("canvas");
	frameRate(30);
	// playerObj = new Player(); //add invincibility frames to each player upon loading in
	// playerObj.id = "player";
	gameState = new Game();
	// gameState.playerList.push(playerObj);
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
	if (gameState.firstAccess) {
		if (clearer) {
			clear();
			clearer = false;
		}
		textSize(28);
		text("Welcome to OctaPong.", 0, 50);
		text("You are the blue paddle.", 0, 100);
		text("Use the left and right arrow keys to rotate.", 0, 150);
		text("Use spacebar to shoot.", 0, 200);
		text("Your goal is to eliminate the opposition.", 00, 250);
		text("You have 5 lives, don't get hit!", 0, 300);
		// text("You have 5 lives.", 0, 400);
		text("Press any key to start.", 0, 400);
		fill(255);
		if (keyIsPressed === true) {
			playerObj = new Player();
			playerObj.id = gameState.id;
			gameState.playerList.push(playerObj);
			clearer = true;
			gameState.alive = true;
			gameState.firstAccess = false;
		}
	} else {
		gameState.package = gameState.unpackager(gameState.package);
		if (gameState.alive) {
			clearer = true;
			translate(width/2, height/2);
			background('black');

			if (gameState.colorCounter <= 11) gameState.colorCounter++;
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
			// check angles of particles and its opposite angle to check what angle the player has to be at for collision to occur

			rotate(radians(gameState.deg)); //note that this can be pushed easily to the server
			for (var i = 0; i < gameState.playerList.length; i++) {
				for (var j = 0; j < gameState.particles.length; j++) {
					if (gameState.particles[j].y == -150) {

						var angleCollision = gameState.particles[j].opp; //this took me way too long to figure out

						if (gameState.deg >= (angleCollision - 25) && gameState.deg <= (angleCollision + 35)) {
							console.log("collision");
							gameState.colorCounter = 0;
							gameState.playerList[i].interaction("red", gameState.colorCounter);
							gameState.particles.splice(j, 1);

							if (gameState.playerList[i].lives <= 0) gameState.playerList.splice(i, 1);
						}
					}
					else if (gameState.particles[j].y <= -180) gameState.particles.splice(j, 1);
				}
				gameState.playerList[i].interaction("", gameState.colorCounter);
				gameState.playerList[i].display();
			}
			if (gameState.deg <= 0) {
				gameState.deg += 360;
			} else if (gameState.deg >= 360) {
				gameState.deg -= 360;
			}
			if (playerObj.lives <= 0) gameState.alive = false;

			socket.emit('gameState', gameState);
		} else {
			if (clearer) {
				clear();
				clearer = false;
			}
			textSize(32);
			text("GAME OVER! Press any key to try again", 10, 150);
			fill(255);
			if (keyIsPressed === true) {
				playerObj = new Player();
				playerObj.id = "gameState.id";
				gameState.playerList.push(playerObj);
				clearer = true;
				gameState.alive = true;
			}
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

function Player()
{
	this.x = 0;
	this.y = 0;
	this.sizeX = 50;
	this.sizeY = 15;
	this.color = "blue";
	this.lives = 5;
	this.points = 0;
	this.id = "";

	this.display = function()
	{
		translate(0, 160);
		fill(this.color);
		rect(this.x, this.y, this.sizeX, this.sizeY);
	}

	this.interaction = function(color, colorCounter)
	{
		if (color == "red") {
			this.lives--;
			this.color = "red";
		}
		if (colorCounter >= 10) {
			this.color = "blue";
		}
	}
}

function otherPlayer(deg, id)
{
	this.x = 0;
	this.y = 0;
	this.sizeX = 50;
	this.sizeY = 15;
	this.color = "red";
	this.lives = 5;
	this.id = id;
	this.deg = radians(deg);
	this.colorCounter = 0;

	this.display = function()
	{
		translate(0, 160);
		fill(this.color);
		push();
		rotate(this.deg);
		rect(this.x, this.y, this.sizeX, this.sizeY);
		pop();
	}

	this.interaction = function(color, colorCounter)
	{
		this.color = color;
		this.colorCounter = colorCounter;
		this.lives--;
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
	this.firstAccess = true;
	this.deg = 0;
	this.particles = [];
	this.playerList = [];
	this.colorCounter = 10;
	this.alive = true;
	this.id = "";
	this.package = null;

	this.unpackager = function(data)
	{
		if (data != null) {
			var enemyPlayer = new otherPlayer(data.deg, data.id);
			this.playerList.push(enemyPlayer);

			if (data.particles.length > 0) {
				for (var i = 0; i < data.particles.length; i++) this.particles.push(data.particles[i]);
			}
		}
		return null;
	}
}


socket.on('connect', function() {
	console.log("Connected");
	gameState.id = socket.id;
});

socket.on('otherGameState', function(data) {
	if (data == null) return;
	var finder = false;
	for (var i = 0; i < gameState.playerList.length; i++) {
		if (gameState.playerList[i].id == data.id){
			finder = true;
			gameState.playerList[i].deg = data.deg;
		}
	}
	if (!finder) gameState.package = data;
});