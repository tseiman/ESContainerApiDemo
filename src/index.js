const yargs = require('yargs');

const HTTPServer        = require('./HTTPServer.js');
const WebSocketServer   = require('./WebSocketServer.js');
const DataHandler       = require('./DataHandler.js');
const RESTClient        = require('./RESTClient.js');




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
    })
    .argv;

if((typeof options.apiserver === undefined) || (! options.apiserver.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/) )  ) {
    console.log("Give the URL of the API server - e.g. like https://192.168.1.1 or https://myxv80.mydomain.bar");
    process.exit(1);
}


var server = new HTTPServer();
var ws = new WebSocketServer(server);
var dh = new DataHandler(ws);


var rc = new RESTClient(options.apiserver, options.user, options.password);
rc.setCallback(dh.sendMessage, dh);
rc.connect();
