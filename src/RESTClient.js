"use strict";

const Client = require('node-rest-client').Client;

class RESTClient {


	constructor(server, user, password) {
		this.servername = server;
		this.apiuser = user;
		this.apuserpw = password;

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


	isTokenValid() {
		if(this.accessToken !== null && this.accessToken !== "") return true;
		return false;
	}


	async connect() {
		var that = this;
		console.log("Connecting to API");
	
		var pollIntervalObj = null

		try {
			await this.autenticate();
			await this.registerEventhandler();
			pollIntervalObj = setInterval(async function () {await that.pollNewEvents(); }, 10000);
		} catch(e) {
			console.error("Cant connect to API service",e);
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
					timeout: 1000
				}
			};

			this.restClient.methods.authenticateMethod(args, function (data, response) {
					var parsedData = JSON.parse(data);
					if(typeof parsedData.data !== undefined && typeof parsedData.data.access_token !== undefined) {
						that.accessToken = JSON.parse(data).data.access_token;
					} else {
						that.accessToken = null;
					}
					console.log("New access token: " + that.accessToken);
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

			console.log("Register API event handler");
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
				if(typeof parsedData.data === undefined) resolve('resolved');
				console.log(parsedData.data);
				resolve('resolved');
			}).on('error',function(err){
					reject(err);
			}); 

		});

	}

	async pollNewEvents() {
		var that = this;
		return new Promise((resolve, reject) => {

			console.log("Poll events");
			if(!this.isTokenValid()) {
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

			this.restClient.methods.getUpdateEvents(args,function (data, response) {
				if(data.length > 0) {
					var parsedData = JSON.parse(data);
					if((typeof parsedData.data === undefined) || (typeof parsedData.data.db === undefined) || (typeof parsedData.data.db.last === undefined)) resolve('resolved');

					console.log(parsedData.data.db.last);
				}
				resolve('resolved');
			}).on('error',function(err){
					reject(err);
			}); 

		});

	}




}
module.exports = RESTClient;