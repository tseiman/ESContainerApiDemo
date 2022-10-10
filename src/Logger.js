/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side - some logging functions may filtering debug messages
 *
 * -------------------------------------------------------------- */


"use strict";


class Logger { 

	static debugSetting  = false;


	static getTimestamp() {
		var m = new Date();
		var dateString = m.getUTCFullYear() + "/" +
		    ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
		    ("0" + m.getUTCDate()).slice(-2) + " " +
		    ("0" + m.getUTCHours()).slice(-2) + ":" +
		    ("0" + m.getUTCMinutes()).slice(-2) + ":" +
		    ("0" + m.getUTCSeconds()).slice(-2);

		return dateString;
	}


	static getCaller() {
		if(!this.debugSetting) return "";
	    var e = new Error();
    	if (!e.stack) {
        	try {
            throw e;
	        } catch (e) {
	           // if (!e.stack) {
	           // }
	        }
    	}
    	var stack = e.stack.toString().split(/\r\n|\n/);
    //	var stack[3].substring(fullPath.lastIndexOf('/') + 1)

    	var result = '(' + stack[3].substring(stack[3].lastIndexOf('/') + 1) + ')';
    	result= result.replace(/\)\)$/,")");

	    return result;
	}


	static log(...msg) {
		console.log(`[${this.getTimestamp()}][LOG]`, msg, this.getCaller());
	}

	static err(...msg) {
		console.error(`[${this.getTimestamp()}][ERR]`, msg, this.getCaller());
	}

	static debug(...msg) {
		this.getCaller();
		if(!this.debugSetting) return;
		console.log(`[${this.getTimestamp()}][DBG]`, msg, this.getCaller());
	}

	static setDebug(...dbg) {
		if(dbg) { 
			this.debugSetting = true;
			this.log("enabled debug prints");
		} else this.debugSetting  = false;
	}

}
module.exports = Logger;