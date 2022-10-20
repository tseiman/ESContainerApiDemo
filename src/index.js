/* ----------------------------------------------------------------
 *
 * (c) October 2022, SWI Thomas Schmidt
 *
 * Demo to present container and API of AirLinkOS
 *
 * Server side main routine takes command line parameters and 
 * initiates the HTTP server and the API client
 *
 * -------------------------------------------------------------- */


const yargs = require('yargs');

const HTTPServer        = require('./HTTPServer.js');
const WebSocketServer   = require('./WebSocketServer.js');
const DataHandler       = require('./DataHandler.js');
const RESTClient        = require('./RESTClient.js');
const Logger            = require('./Logger.js');
const Version           = require('./VERSION.js');

var Ping = require('ping');


const options = yargs
    .option("a", { 
        alias: "apiserver", 
        describe: "The URL of the API server - e.g. like https://192.168.1.1 or https://myxv80.mydomain.bar", 
        type: "string", 
        default: "https://192.168.1.1",
        demandOption: false
    })
    .option("u", { 
        alias: "user", 
        describe: "The name of the user for the Router API", 
        type: "string",
        default: "admin", 
        demandOption: false 
    })
    .option("p", { 
        alias: "password", 
        describe: "The password for the API user", 
        type: "string",
        demandOption: true 
    }).option("d", { 
        alias: "debug", 
        describe: "enable debug prints", 
        type: "boolean",
         default: false, 
        demandOption: false 
    })
    .argv;

if(options.debug) {
    Logger.setDebug(true);
}

if((options.apiserver == null) || (! options.apiserver.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/) )  ) {
    Logger.err("Give the URL of the API server - e.g. like https://192.168.1.1 or https://myxv80.mydomain.bar");
    process.exit(1);
}

Logger.log('Source Git Commit', Version.getCommit());
Logger.log('Source Git Tag',  Version.getTag());

var serveraddress = options.apiserver.match(/^https?:\/\/(.*)(:[0-9]+)?/);
serveraddress = serveraddress[1];

Ping.sys.probe(serveraddress, function(isAlive){
        var msg = isAlive ? 'host ' + serveraddress + ' is alive' : 'host ' + serveraddress + ' is dead';
        Logger.log(msg);
});

var server = new HTTPServer();
var ws = new WebSocketServer(server);
var dh = new DataHandler(ws);


var rc = new RESTClient(options.apiserver, options.user, options.password);
async function setupRC() {
    rc.setCallback(dh.sendMessage, dh);
    await rc.connect();
    await rc.getSystemInfo();
}
setupRC();
