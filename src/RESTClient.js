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
		this.firstRun = true;

		this.accessToken = null;

		var options = {
			connection: {
				rejectUnauthorized: false
			}
		};

		this.restClient = new Client(options);

		this.restClient.registerMethod("authenticateMethod",  this.servername + "/api/v1/auth/tokens", "POST");
		this.restClient.registerMethod("registerEventMethod", this.servername + "/api/v1/register/db", "POST");
		this.restClient.registerMethod("getSystemInfoMethod", this.servername + "/api/v1/db/get", "POST");
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
	
		return new Promise(async (resolve, reject) => {

			var pollIntervalObj = null

			try {
				if(!this.isTokenValid()) await this.autenticate();
				if(that.firstRun) {
					await that.getSystemInfo();
					that.firstRun = false;
				}
				await this.registerEventhandler();

				pollIntervalObj = setInterval(async function () {await that.pollNewEvents(); }, 10000);

			} catch(e) {
				Logger.err("Cant connect to API service",e);
				if(pollIntervalObj !== null) clearInterval(pollIntervalObj);
				pollIntervalObj = null;
			}
			resolve('resolved');
		});

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

	async getSystemInfo() {
		var that = this;
		return new Promise(async (resolve, reject) => {

			Logger.log("Get System Info");
			if(!that.isTokenValid()) {
				Logger.err("Invalid token");
				await that.autenticate();
			}

			var args = {
				headers: { 
					"Content-Type": "application/json",
					"accept": "application/vnd.api+json",
					"Authorization": "Bearer " + this.accessToken
				},
				parameters: { fetch: true},
				data:   
				    [ { "fields": [ 
				    	"system.datastore.stats.avg.cpu15m"					, "system.datastore.stats.avg.cpu1m"			, "system.datastore.stats.avg.cpu5m"		, 
				    	"system.geolocation.current.iso2"					, "system.geolocation.current.name"				, "system.geolocation.current.region"		, 
				    	"system.hardware.check[wifi].present"				, "system.hardware.expansion[ExpansionR].id"	, "system.hardware.expansion[ExpansionR].init.status"	, 
				    	"system.hardware.expansion[ExpansionR].modems"		, "system.hardware.id"							, "system.init.done"						, 
				    	"system.mcu.temperature.state"						, "system.mcu.temperature.value"				, "system.mcu.voltage.state"				, 
				    	"system.mcu.voltage.value"							, "system.os.builddate"							, "system.os.buildnumber"					,
				      	"system.os.codeset.active"							, "system.os.codeset.inactive"					, "system.os.monitoring.storage[1].free"	,
				      	"system.os.monitoring.storage[1].name"				, "system.os.monitoring.storage[1].usage"		, "system.os.monitoring.storage[2].name"	,
				      	"system.os.monitoring.storage[2].usage"				, "system.os.monitoring.storage[3].name"		, "system.os.monitoring.storage[3].usage"	,
				      	"system.os.name"
				    ] } ]
				  ,
				requestConfig: {
					timeout: 1000
				}
			};

			this.restClient.methods.getSystemInfoMethod(args,async function (data, response) {
				if(data.length > 0) {
					var parsedData = JSON.parse(data);
					if((parsedData.data == null) || (parsedData.data[0] == null) ) resolve('resolved');
					Logger.debug("System Info:", JSON.stringify(parsedData,null,2));

				} else {
					Logger.err("system info returned zero length", response.statusMessage);
					if(response.statusMessage === "Unauthorized") {
						await that.autenticate();
					}
				}
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