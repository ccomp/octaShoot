// HTTP PORTION

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

// WEBSOCKET PORTION

var io = require('socket.io').listen(httpServer);
var players = [];

io.on('connection', 

	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		players.push(socket.id);

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
		});
	}
);