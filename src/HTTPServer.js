/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side - runs the HTTP server which delivers the static 
 * HTTP content and updates the connection to WebSocket if possible
 *
 * -------------------------------------------------------------- */

"use strict";

const http = require('http');
const https = require('https');
const fs = require('fs');
const tls = require('tls');
const path = require('path');
const Logger            = require('./Logger.js');

class HTTPServer {


	constructor() {

		Logger.log("initializing http server");
		
		var that = this;
		this.wwwPath = path.join(__dirname, 'www');
		
		var httpServer = http.createServer(function(req, res) { that.handleRequest(req, res); }).listen(8080, function (err) {
		    if (!err) {
		    	Logger.log('listening on http://' + httpServer.address().address + ':' + httpServer.address().port + '/');
		    }
		});

		var options = {
		    key: fs.readFileSync(path.join(__dirname, 'cert/server.key')),
		    cert: fs.readFileSync(path.join(__dirname, 'cert/server.crt'))
		};
		var httpsServer = https.createServer(options, function(req, res) { that.handleRequest(req, res); }).listen(8443, function (err) {
		    if (!err) {
		    	Logger.log('listening on https://' + httpsServer.address().address + ':' + httpsServer.address().port + '/ with self-signed certificate (warning is OK)');
		    } 
		});

		this.httpServer = httpServer;
		this.httpsServer = httpsServer;

	}

	handleRequest(req, res) {
		var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	    var url = req.url == '/' ? '/index.html' : req.url;

	    // add more as required...
	    var contentType;
	    if (url.substr(-4) == '.png')
	        contentType = 'image/png';
	    else if (url.substr(-4) == '.css')
	        contentType = 'text/css';
	    else
	        contentType = 'text/html';
	    res.setHeader("Content-Type", contentType);

	    Logger.log("Serving to [" + ip + "]" + this.wwwPath + url);

	    var stream = fs.createReadStream(this.wwwPath + url);
	    stream.on('error', function (err) {
	        res.statusCode = 404;
	        res.end(err.message);
	    });
	    stream.pipe(res);
	}

}
module.exports = HTTPServer;
