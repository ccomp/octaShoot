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
}

function randomWholeNum(range) {
	return Math.floor(Math.random() * range);
}


function recursePoly(x, y, theta)
{
	if (theta >= 6.283185307179586) return;
	var a = (width/2) + cos(theta+angle)*polyRad;
	var b = (height/2) + sin(theta+angle)*polyRad;
	recursePoly(a, b, theta+angle);
	vertDist = dist(x, y, a, b);
	stroke(100);
	var m = (b-y)/(a-x);
	var xPrime = -m*(b-y-(x/m));
	line(x, y, xPrime, b);
	stroke(255);
	return line(x, y, a, b);
}

function draw() 
{
	var hit;
	var hitCounter = 0;
	background('black');
	var x = recursePoly((width/2) + cos(0)*polyRad, (height/2) + sin(0)*polyRad, 0);
	playerObj.display();

	if (keyIsDown(LEFT_ARROW)) {
		// if (dist(playerObj.x, playerObj.y, ) {}
		playerObj.x-=10;
	}

	if (keyIsDown(RIGHT_ARROW)) {
		playerObj.x+=10;
		// playerObj.y -= (sin(3.14/16)/cos(3.14/16)); 
	}
	/*
	if (playerObj.lives > 0) 
	{
		if (colorCounter >= 10){
			playerObj.color = "blue";
		}
		if (counter1 >= 20) {
			counter1 = 0;
			counter2++;
		}
		if (counter2 >= difficulty) counter2 = difficulty;

		background('black');

		if (keyIsDown(LEFT_ARROW) && (playerObj.x - 10 >= 0)) {
			playerObj.x -= 10;
		}

		if (keyIsDown(RIGHT_ARROW) && (playerObj.x + 10 < 600)) {
			playerObj.x += 10;
		}

		playerObj.display();

		for (var i = 0; i < counter2; i++) 
		{
			particles[i].y+=10;
			particles[i].display();

			hit = collideRectCircle(playerObj.x, playerObj.y, playerObj.sizeX, playerObj.sizeY, particles[i].x, particles[i].y, particles[i].size);
			if (hit) {
				colorCounter = 0;
				playerObj.color = particles[i].color;
				playerObj.interaction(playerObj.color);
				particles[i].size = 0;
				particles[i] = new Particle(ColorID(randomWholeNum(3)));
			}
			if (particles[i].y >= windowHeight) {
				particles[i] = new Particle(ColorID(randomWholeNum(3)));
			}
		}
		counter1++;
		colorCounter++;
		document.getElementById('points').innerHTML = "Points: " + playerObj.points;
		document.getElementById('lives').innerHTML = "Lives: " + playerObj.lives;
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
			clearer = true;
		}
	}
	*/
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
	// this.x = (cos(angle)*r) + width/2;
	// this.y = (sin(angle)*r) + height/2;
	this.x = 0;
	this.y = 0;
	this.sizeX = 50;
	this.sizeY = 25;
	this.color = "blue";
	this.lives = 3;
	this.points = 0;

	this.display = function()
	{
		translate(((width/2)+(cos(angle*6)))+(50), (((height/2)+(sin(angle*6)))+(polyRad-50)));
		fill(this.color);
		rotate(-(3.14/8));
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