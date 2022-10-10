/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side - the WebSocket is initiated and run from here
 * data might be distributed on demand to the WebClients
 *
 * -------------------------------------------------------------- */

"use strict";

var WebSocket = require('ws');

class WebSocketServer {

	constructor(server) {
		var that = this;
		this.server = server;

		this.triggerEmitterOnConnect = [];

		this.wss = new WebSocket.Server({ noServer: true });

		this.wss.on('connection', function connection(ws) {
		    ws.on('message', function incoming(data) {
		        that.onMessage(data, ws);
		    });
		    console.log("Connected client !!");
		    for(const emitter of that.triggerEmitterOnConnect) {
		    	emitter.emitter(emitter.ctx);
//		    	console.log("emitting  !!", emitter);
		    }
		    
		});


		this.server.httpServer.on('upgrade', function(req, socket, head) { that.upgradeToWSS(req, socket, head) });
		this.server.httpsServer.on('upgrade', function(req, socket, head) { that.upgradeToWSS(req, socket, head) });
	} 

	registerEmitterTrigger(emitter, ctx) {
		console.log("registerEmitterTrigger(emitter, ctx)");
		this.triggerEmitterOnConnect.push({'emitter': emitter, 'ctx': ctx});
	}



	sendJSON(data, wss) {
		console.log("Send JSON to Client serverinitiated");
		var jsonStr = JSON.stringify(data);
		if( ( wss == null) || (wss.clients == null)) {
			console.log("no WS clients");
			return;
		}
		wss.clients.forEach(function each(client) {
            if ( client.readyState === WebSocket.OPEN) {
                client.send(jsonStr);
            }
        });
	}

	onMessage(data, ws) {
		console.log("receiving data: " + data);
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
