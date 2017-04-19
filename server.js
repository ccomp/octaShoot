// HTTP PORTION
// need to dynamically create rooms depending on the amount of players


var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}

function roomObj(id)
{
	this.list = [];
	this.id = id;
	this.amount = 0;
	this.addNew = function(client)
	{
		this.list.push(client);
		this.amount = this.list.length;
		return this.id;
	}
}

function roomba(init)
{
	this.list = [init];
	this.limit = 6;
	this.nextEmpty = 0;
	this.joinRoom = function(client)
	{
		if (this.list[this.nextEmpty].amount >= this.limit)
		{
			this.nextEmpty++;
			var nextRoom = new roomObj(toString(this.nextEmpty));
			this.list.push(nextRoom);
		}
		return this.list[this.nextEmpty].addNew(client);
	}
}

// WEBSOCKET PORTION

var io = require('socket.io').listen(httpServer);
var players = [];
var room0 = new roomObj('0');
var rooms = new roomba(room0);

io.on('connection', 

	function (socket) {

		console.log("We have a new client: " + socket.id);
		players.push(socket.id);

		socket.on('room', function(client)
		{
			socket.join(rooms.joinRoom(client));
		});

		///MY SOCKET EVENTS HERE

		socket.on('gameState', function(data) {
			socket.broadcast.emit('otherGameState', data);
			socket.emit('numberOfPlayers', players.length);
		});

		socket.on('particlePass', function(data) {
			socket.broadcast.emit('otherParticle', data);
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			socket.emit('disconnected', socket.id);
			for (var i = 0; i < players.length; i++) {
				if (players[i] == socket.id) players.splice(i,1);
			}
		});
	}
);

