var socket = io.connect();
var playerObj, gameState;
var hit = false;
var colorCounter = 0;
var clearer = true;
var polyRad = 200;
var polyPoints = 8;
var touchBool = false;
var angle = 6.283185307179586/polyPoints;
// 153.07337294603593

function init() {
	function handleOrientation(event) {

		var alpha = Math.floor(event.alpha);
		var beta = Math.floor(event.beta);
		var gamma = Math.floor(event.gamma);

		if (gameState != null) {
			gameState.zOrientation = alpha;
			gameState.yOrientation = beta;
			gameState.xOrientation = gamma;
			gameState.update(gameState.xOrientation);
		}
	}
	function handleTouch(event) {
		event.preventDefault();
		if (gameState != null) {
			if (gameState.firstAccess === false) {
				if (playerObj != null) {
					particleNew = new Particle(playerObj.x+25, playerObj.y + (polyRad-40), gameState.deg, "blue");
					gameState.particles.push(particleNew);
					console.log(gameState.deg);
					socket.emit('particlePass', particleNew);
				}
			}
		}
	}
	var canvassio = document.getElementById("canvas");
	window.addEventListener("deviceorientation", handleOrientation, true);
	canvassio.addEventListener("touchstart", handleTouch, false);
}

function touchStarted() {
	touchBool = true;
}

function setup() {

	var x0 = window.innerHeight/1.5;
	var y0 = window.innerWidth/1.5;

	console.log(y0);
	var myCanvas = createCanvas(y0, x0);
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
		// text("Welcome to OctaPong.", 0, 50);
		// text("You are the blue paddle.", 0, 100);
		// text("Use the left and right arrow keys to rotate.", 0, 150);
		// text("Use spacebar to shoot.", 0, 200);
		// text("Your goal is to eliminate the opposition.", 00, 250);
		// text("You have 5 lives, don't get hit!", 0, 300);
		// // text("You have 5 lives.", 0, 400);
		text("Press any key to join the server.", 100, 200);
		fill(255);
		if (keyIsPressed === true || touchBool === true) {
			playerObj = new Player();
			playerObj.id = gameState.id;
			gameState.playerList.push(playerObj);
			clearer = true;
			gameState.alive = true;
			gameState.firstAccess = false;
			touchBool = false;
		}
	} else {
		if (gameState.id) {
			document.getElementById("connectionStatus").innerHTML = "";	

			gameState.package = gameState.unpackager(gameState.package);
			gameState.particlePackage = gameState.particleUnpackager(gameState.particlePackage);
			if (gameState.alive) {

				// document.getElementById(kills).innerHTML = "Kills: " + playerObj.kills;
				// document.getElementById(lives).innerHTML = "Lives remaining: " + playerObj.lives;
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
					gameState.particles[i].y -= 10;
					gameState.particles[i].display();
				}

				for (var i = 0; i < gameState.enemyPlayerList.length; i++) {
					gameState.enemyPlayerList[i].display();
					for (var j = 0; j < gameState.particles.length; j++) {
						if (gameState.particles[j].y == -polyRad+40) {

							var angleCollision = gameState.particles[j].opp; //this took me way too long to figure out

							if (toDegree(gameState.enemyPlayerList[i].deg) >= (angleCollision - 25) && toDegree(gameState.enemyPlayerList[i].deg) <= (angleCollision + 35)) {
								console.log("collision");
								gameState.enemyPlayerList[i].interaction("", gameState.colorCounter);
								gameState.particles.splice(j, 1);

								if (gameState.enemyPlayerList[i].lives <= 0) {
									var toDelete = gameState.enemyPlayerList[i];
									gameState.enemyPlayerList[i].color = "black";
									gameState.enemyPlayerList[i].display();
									gameState.enemyPlayerList.splice(i, 1);
									playerObj.kills++;
								}
							}
						}
						else if (gameState.particles[j].y <= -polyRad+30) gameState.particles.splice(j, 1);
					}
				}

				// spoof collision:
				// check angles of particles and its opposite angle to check what angle the player has to be at for collision to occur

				rotate(radians(gameState.deg)); //note that this can be pushed easily to the server
				for (var i = 0; i < gameState.playerList.length; i++) {

					gameState.playerList[i].interaction("", gameState.colorCounter);
					gameState.playerList[i].display();
					for (var j = 0; j < gameState.particles.length; j++) {
						if (gameState.particles[j].y == -polyRad+40) {

							var angleCollision = gameState.particles[j].opp; //this took me way too long to figure out

							if (gameState.deg >= (angleCollision - 25) && gameState.deg <= (angleCollision + 35)) {
								console.log("collision");
								gameState.colorCounter = 0;
								gameState.playerList[i].interaction("red", gameState.colorCounter);
								gameState.particles.splice(j, 1);

								if (gameState.playerList[i].lives <= 0) {
									gameState.playerList[i].color = "black";
									gameState.playerList.splice(i, 1);
								}
							}
						}
						else if (gameState.particles[j].y <= -polyRad+30) gameState.particles.splice(j, 1);
					}
				}
				if (gameState.deg <= 0) {
					gameState.deg += 360;
				} else if (gameState.deg >= 360) {
					gameState.deg -= 360;
				}
				if (playerObj.lives <= 0) gameState.alive = false;

				if (gameState.alive) socket.emit('gameState', gameState);

				document.getElementById("kills").innerHTML = "Total kills: " + playerObj.kills;
				document.getElementById("lives").innerHTML = "Lives remaining: " + playerObj.lives;
				
			} else {
				if (clearer) {
					clear();
					clearer = false;
				}
				textSize(32);
				text("GAME OVER! Press any key to try again", 10, 150);
				fill(255);
				if (keyIsPressed === true || touchBool === true) {
					playerObj = new Player();
					playerObj.id = "gameState.id";
					gameState.playerList.push(playerObj);
					clearer = true;
					gameState.alive = true;
					touchBool = false;
				}
			}
		} else {
			document.getElementById("connectionStatus").innerHTML = "Waiting for connection...";	
		}
	}
	
}

function keyPressed() {
	if (keyCode === 32) {
		if (playerObj != null) {
			particleNew = new Particle(playerObj.x+25, playerObj.y + polyRad-40, gameState.deg, "blue");
			gameState.particles.push(particleNew);
			console.log(gameState.deg);
			socket.emit('particlePass', particleNew);
		}
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
	this.kills = 0;
	this.id = "";

	this.display = function()
	{
		translate(0, polyRad-40);
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
		if (this.lives <= 0) {
			this.color = "black";
		}
		push();

		rotate(this.deg);
		translate(0, polyRad-40);
		fill(this.color);
		rect(this.x, this.y, this.sizeX, this.sizeY);
		pop();
	}

	this.interaction = function(color, colorCounter)
	{
		var yeah = color;
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
	this.zOrientation = 0;
	this.xOrientation = 0;
	this.yOrientation = 0;
	this.firstAccess = true;
	this.deg = 0;
	this.particles = [];
	this.enemyPlayerList = [];
	this.playerList = [];
	this.colorCounter = 10;
	this.alive = true;
	this.id = null;
	this.package = null;
	this.particlePackage = null;

	this.update = function(x0)
	{	
		if (x0 > 90) x0 = 90;
		else if (x0 < -90) x0 = -90;
		x0 /= 10;
		this.deg -= x0;
	}

	this.unpackager = function(data)
	{
		if (data != null) {
			var enemyPlayer = new otherPlayer(data.deg, data.id);
			this.enemyPlayerList.push(enemyPlayer);
		}
		data = null;
		return null;
	}

	this.particleUnpackager = function(data)
	{
		if (data != null) {
			var enemyParticle = new Particle(data.x, data.y, toDegree(data.deg), "red");
			this.particles.push(enemyParticle);
		}
		data = null;
		return null;
	}
}


socket.on('connect', function() {
	console.log("Connected");
	while (socket.id === undefined)
	{
		document.getElementById("connectionStatus").innerHTML = "Waiting for connection...";
	}
	gameState.id = socket.id;
});

socket.on('otherGameState', function(data) {
	if (data == null) return;
	var finder = false;
	for (var i = 0; i < gameState.enemyPlayerList.length; i++) {
		if (gameState.enemyPlayerList[i].id == data.id){
			finder = true;
			gameState.enemyPlayerList[i].deg = radians(data.deg);
		}
	}
	if (!finder) gameState.package = data;
});

socket.on('otherParticle', function(data) {
	gameState.particlePackage = data;
});

socket.on('numberOfPlayers', function(num) {
	if (num > 1) {
		document.getElementById("playerCount").innerHTML = "Players in game: " + num;
	} else {
		document.getElementById("playerCount").innerHTML = "Waiting for other players to join.";
	}
});

window.addEventListener('load', init);