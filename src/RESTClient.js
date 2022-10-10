/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side - the RESt client which authenticates and connects
 * to the AirLink OS and polls the data from the API event queue.
 * Data is forwarded to the DataHandler where the server side 
 * data structure is updated
 *
 * -------------------------------------------------------------- */

"use strict";

const Client 			= require('node-rest-client').Client;
const Logger            = require('./Logger.js');

class RESTClient {


	constructor(server, user, password) {
		this.servername = server;
		this.apiuser = user;
		this.apuserpw = password;
		this.callback = null;

		this.accessToken = null;

		var options = {
			connection: {
				rejectUnauthorized: false
			}
		};

		this.restClient = new Client(options);

		this.restClient.registerMethod("authenticateMethod",  this.servername + "/api/v1/auth/tokens", "POST");
		this.restClient.registerMethod("registerEventMethod", this.servername + "/api/v1/register/db", "POST");
		this.restClient.registerMethod("getUpdateEvents", this.servername + "/api/v1/events", "GET");

	}

	setCallback(cb, ctx) {
		this.callback = cb;
		this.callbackCtx = ctx;
	}

	isTokenValid() {
		if(this.accessToken !== null && this.accessToken !== "") return true;
		return false;
	}


	async connect() {
		var that = this;
		Logger.log("Connecting to API");
	
		var pollIntervalObj = null

		try {
			await this.autenticate();
			await this.registerEventhandler();
			pollIntervalObj = setInterval(async function () {await that.pollNewEvents(); }, 10000);
		} catch(e) {
			Logger.err("Cant connect to API service",e);
			if(pollIntervalObj !== null) clearInterval(pollIntervalObj);
			pollIntervalObj = null;
		}

	}



	async autenticate() {
		var that = this;
		return new Promise((resolve, reject) => {
			var args = {
				data: {
	  					"login": this.apiuser,
	  					"password": this.apuserpw
				},
				headers: { 
					"Content-Type": "application/json",
					"accept": "application/vnd.api+json"
				},
				requestConfig: {
					timeout: 2000
				}
			};

			this.restClient.methods.authenticateMethod(args, function (data, response) {
					var parsedData = JSON.parse(data);
					if(parsedData.data != null && parsedData.data.access_token != null) {
						that.accessToken = JSON.parse(data).data.access_token;
					} else {
						Logger.log("API HTTP Message response: " + response.statusMessage);
						Logger.debug("Response data:", data);
						that.accessToken = null;
					}
					Logger.debug("New access token: " + that.accessToken);
					// that.registerEventhandler();
					resolve('resolved');
			}).on('error',function(err){
					reject(err);
			}); 

		});

	}

	async registerEventhandler() {
		var that = this;
		return new Promise((resolve, reject) => {

			Logger.debug("Register API event handler");
			if(!this.isTokenValid()) {
				reject("Invalid token cant register eventMethod");
			}

			var args = {
				headers: { 
					"Content-Type": "application/json",
					"accept": "application/vnd.api+json",
					"Authorization": "Bearer " + this.accessToken
				},
				parameters: { fetch: true},
				data: {
					"last": [
				    	"net.wifi.ssid"
				  	]
				},
				requestConfig: {
					timeout: 1000
				}
			};

			this.restClient.methods.registerEventMethod(args,function (data, response) {
				var parsedData = JSON.parse(data);
				if(parsedData.data == null) resolve('resolved');
				that.callback(parsedData.data, that.callbackCtx);

				resolve('resolved');
			}).on('error',function(err){
					reject(err);
			}); 

		});

	}

	async pollNewEvents() {
		var that = this;
		return new Promise((resolve, reject) => {

			Logger.log("Poll events");
			if(!this.isTokenValid()) {
				Logger.err("Invalid token");
				reject("Invalid token cant register eventMethod");
			}

			var args = {
				headers: { 
					"Content-Type": "application/json",
					"accept": "application/vnd.api+json",
					"Authorization": "Bearer " + this.accessToken
				},
				requestConfig: {
					timeout: 1000
				}
			};

			this.restClient.methods.getUpdateEvents(args,async function (data, response) {
				if(data.length > 0) {
					var parsedData = JSON.parse(data);
					if((parsedData.data == null) || (parsedData.data.db == null) || (parsedData.data.db.last == null)) resolve('resolved');

					that.callback(parsedData.data.db.last, that.callbackCtx);

				} else {
					Logger.err("poll returned zero length", response.statusMessage);
					if(response.statusMessage === "Unauthorized") {
						await that.autenticate();
						await that.registerEventhandler();
					}
				}
				resolve('resolved');
			}).on('error',function(err){
					reject(err);
			}); 

		});

	}




}
module.exports = RESTClient;