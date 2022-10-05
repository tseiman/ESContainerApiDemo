"use strict";

var WebSocket = require('ws');

class WebSocketServer {

	constructor(server) {
		var that = this;
		this.server = server;

		this.wss = new WebSocket.Server({ noServer: true });

		this.wss.on('connection', function connection(ws) {
		    ws.on('message', function incoming(data) {
		        that.onMessage(data);
		    });
		});


		this.server.httpServer.on('upgrade', function(req, socket, head) { that.upgradeToWSS(req, socket, head) });
		this.server.httpsServer.on('upgrade', function(req, socket, head) { that.upgradeToWSS(req, socket, head) });
	} 



	onMessage(data) {
		console.log("sending data: " + data);
        this.wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
	}


	upgradeToWSS(req, socket, head) {
		var that = this;
	    if (req.url === '/event') {
	        console.log("webbrowser connected server");

	        that.wss.handleUpgrade(req, socket, head, function done(ws) {
	            that.wss.emit('connection', ws, req);
	        });
	    } else { 
	        socket.destroy();
	    }
	}


}
module.exports = WebSocketServer;
