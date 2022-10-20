/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side - contains the data structure and manages the data
 *
 * -------------------------------------------------------------- */


"use strict";
const Logger            = require('./Logger.js');

const TIMEOUT_IN_SECONDS = 5*50;
class DataHandler {

	constructor(ws) {
		const that = this;
		this.websocket = ws;
		ws.registerEmitterTrigger(this.emitStatus, this);

		this.wifiStations = {};
	} 


	emitStatus(ctx) {
		Logger.debug("emitStatus(ctx)");
		ctx.websocket.sendJSON(ctx.wifiStations,ctx.websocket.wss);
	}

	sendMessage(data, ctx) {
		
		var tmpdata = {};

		if(data == null) { 
			Logger.error("Empty data provided for sendMessage(), data==null"); 
			return; 
		}

		var keys = Object.keys(data);
		
		if(keys.length === 0 && Object.getPrototypeOf(data) === Object.prototype) {
			Logger.error("Empty data provided for sendMessage(), empty data or invalid JSON"); 
			return; 
		}

		keys.forEach(function(k){


			var keyList = k.match(/.*net\.wifi\.ssid\.scan\[([0-9a-zA-Z]*)\].*/);
			if(keyList == null || keyList.length == null || keyList.length < 2) {
				Logger.log("No Data - skipping dataset");
				Logger.debug(data);
				return;
			}
			var key = keyList[1];
			key = key.replace("\'","");
			key = key.replace("\"","");

			var valuesList = k.match(/.*net\.wifi\.ssid\.scan\[[0-9a-zA-Z]*\]\.(.*)/);

			ctx.wifiStations[key] = ctx.wifiStations[key] || {};
			ctx.wifiStations[key].present = true;
			ctx.wifiStations[key].lastseen = Math.floor(Date.now() / 1000);


			if(valuesList === null) {
				ctx.wifiStations[key].present = data[k];

			} else {
				var valuekey = valuesList[1].replace(".","_");
				var value = data[k];


				if(valuekey.match(/^band(5000|2400)*/)) {

					ctx.wifiStations[key].bands = ctx.wifiStations[key].bands || {};
					
					if(value !== null) {

						var valueSplit = value.split('\n\n');

						for (const channel of valueSplit) {

								

							var tmpValueObj = {};
							if(channel === "") {
								continue;
							}

							var regexedChannel = channel.match(/Channel\s*:\s*([0-9]{1,2})\s*\(([.0-9]+)GHz\)\s*\n\s*BSSID\s*:\s*(([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}))\s*\n\s*RSSI\s*:\s*(-?[0-9]+)dBm\s*\(([0-5]) Bars\)/);

							if(regexedChannel[1] != null) { tmpValueObj.channel = parseInt(regexedChannel[1]); 				} else tmpValueObj.channel = null;
							if(regexedChannel[2] != null) { tmpValueObj.band = regexedChannel[2] === "2.4" ? '2400': '5000'; 	} else tmpValueObj.band = null;
							if(regexedChannel[3] != null) { tmpValueObj.bssid =regexedChannel[3]; 								} else tmpValueObj.bssid = null;
							if(regexedChannel[7] != null) { tmpValueObj.rssi = parseInt(regexedChannel[7]); 					} else tmpValueObj.rssi = null;
							if(regexedChannel[8] != null) { tmpValueObj.bars = parseInt(regexedChannel[8]); 					} else tmpValueObj.bars = null;
								
							ctx.wifiStations[key].bands[tmpValueObj.band + '_' + tmpValueObj.channel] = tmpValueObj;
						

						}
						
					}
					
					
				} else {
					ctx.wifiStations[key][valuekey] = value;
				}
				
			}
		});

		Object.keys(ctx.wifiStations).forEach(function(k){ 

 				if((ctx.wifiStations[k].lastseen + TIMEOUT_IN_SECONDS) < Math.floor(Date.now() / 1000)) {
 					ctx.wifiStations[k].present =null;
 					ctx.wifiStations[k].ssid = null;
 					Logger.log("invalidating station due to timeout");
 				}

				if(ctx.wifiStations[k].present === null || ctx.wifiStations[k].ssid === null) {
 					Logger.log("Removing station with key(" + k + ") ");
 					delete ctx.wifiStations[k];
 				} 


		});
		Logger.debug("got new data: ", ctx.wifiStations);
		ctx.websocket.sendJSON(ctx.wifiStations,ctx.websocket.wss);



	}


	

}
module.exports = DataHandler;
