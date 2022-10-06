"use strict";

class DataHandler {

	constructor(ws) {
		const that = this;
		this.websocket = ws;

		this.wifiStations = {};
	} 



	sendMessage(data, ctx) {
		
		var tmpdata = {};
		
		Object.keys(data).forEach(function(k){


			var keyList = k.match(/.*net\.wifi\.ssid\.scan\[([0-9a-zA-Z]*)\].*/);
			if(keyList.length < 2) return;
			var key = keyList[1];
			key = key.replace("\'","");
			key = key.replace("\"","");

			var valuesList = k.match(/.*net\.wifi\.ssid\.scan\[[0-9a-zA-Z]*\]\.(.*)/);

			ctx.wifiStations[key] = ctx.wifiStations[key] || {};
			ctx.wifiStations[key].present = true;

//			console.log(data[k]);
			if(valuesList === null) {
				ctx.wifiStations[key].present = data[k];
 				

			} else {
				var value = valuesList[1].replace(".","_");
				ctx.wifiStations[key][value] = data[k];
			//	console.log(k, key,  data[k], );
			}
	


// 		console.log(JSON.parse('{' +  k + ': "' + data[k] + '"}'));
 	//	console.log(ctx.wifiStations);


				
//			var values = valuesList.length > 1 ? valuesList[1] : null;
//			console.log("got new data: ", key,values);

		});

		Object.keys(ctx.wifiStations).forEach(function(k){ 

				if(ctx.wifiStations[k].present === null || ctx.wifiStations[k].ssid === null) {
 					console.log("Removing station with key(" + k + ") ");
 					delete ctx.wifiStations[k];
 				} 

		});
		 console.log("got new data: ", ctx.wifiStations);




	}


	

}
module.exports = DataHandler;
