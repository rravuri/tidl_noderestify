@!(model)

function createServer(config) {
	config = config || require('./lib/configuration.js');
@{
    var interfaces=[];
    Object.getOwnPropertyNames(model.Interfaces).forEach(function(intfName){
        interfaces.push(model.Interfaces[intfName]);
    });         
}
	apis=[
    @for(var i=0; i<interfaces.length; i++) { @{intf = interfaces[i]}
    	'@(intf.Name.toLowerCase())',
   	}
	];


	var http= require('http'),
    	url = require('url'),
    	util= require('util');

	var log = config.logger || require('./lib/logger.js').create(config);

	var restify, NotImplementedError=null;

	try{
   	 	restify = require('restify');
    	NotImplementedError=function _NotImplementedError(message) {
        	restify.RestError.call(this, {
            	statusCode: 501,
            	message: message,
            	constructorOpt: NotImplementedError
        	});
        	this.name = 'NotImplemented';
    	};
    	util.inherits(NotImplementedError, restify.RestError);
	}
	catch(e){
    	log.fatal("Unable to load 'restify' node module.");
    	log.info("verify the node module load path.");
    	log.info("verfy that 'npm install' was run to install the dependencies.");
    	process.exit(-1);
	}

	//create server instance
	var server = restify.createServer({
   	 	//certificate	    String	If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
    	//key	            String	If you want to create an HTTPS server, pass in the PEM-encoded certificate and key

    	//formatters	    Object	Custom response formatters for res.send()
    	formatters: {
        	//'application/vnd.collection+json': require('./collection_json.js').format,
        	'application/xml': function (req, res, body) {
            	var opts={ declaration: true };
            	function xml2js(item, name){
                	if (item==null || item==undefined){
                    	return '';
                	}
                	if (typeof item== 'function')
                    	return '';
                	if (Buffer.isBuffer(body)) {
                    	return "<data>" + body.toString('base64') + "</data>";
                	}
                	if (body instanceof Error) {
                   		return "<error><code>"+(body.code||'Error')+'</code><message>'+body.message+ "</message></error></data>";
                	}
                	if (util.isArray(item)){
                    	var xmlstring='<'+(name||'data')+' type="array">';
                    	item.forEach(function(val){
                        	xmlstring+=xml2js(val);
                    	});
                    	xmlstring+="</"+ (name||'data')+ ">"
                    	return xmlstring;
                	}
                	if (typeof item == 'object'){
                    	var xmlstring='<'+(name||'data')+' type="object">';
                    	Object.getOwnPropertyNames(item).forEach(function(key){
                        	xmlstring+=xml2js(item[key], key);
                    	});
                    	xmlstring+="</"+ (name||'data')+ ">"
                    	return xmlstring;
                	}
                	var xmlstring='<'+(name||'data')+' type="array">';
                
                	xmlstring+=item.toString();

                	xmlstring+="</"+ (name||'data')+ ">"
                	return xmlstring;
            	}
            	return xml2js(body);
        	},
        	'application/json': function (req, res, body) {
            	var u = url.parse(req.url, true);
            	var data=body;
            	if (body instanceof Error) {
                	data={error:{message:body.message,code:body.code||'Error'}};
            	}
            	if (u.query && u.query._pretty) {
                	return JSON.stringify(data,null,'  ');
            	}
            	else {
                	return JSON.stringify(data);
            	}
        	},  
    	},

    	//log
    	log: log,

    	//name	            String	By default, this will be set in the Server response header, default is restify
    	name: '@model.Service-tapi'

    	//spdy	            Object	Any options accepted by node-spdy
    	//version	        String	A default version to set for all routes
    	//handleUpgrades    Boolean	Hook the upgrade event from the node HTTP server, pushing Connection: Upgrade requests through the regular request handling chain; defaults to false
	});

	config.logger = log;

	server.config = config;

	server.NotImplementedError=NotImplementedError;

	//configure the pipeline
	server.pre(restify.pre.sanitizePath());
	server.use(restify.queryParser());
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.dateParser());
	server.use(restify.authorizationParser());
	server.use(restify.jsonp());
	server.use(restify.gzipResponse());
	server.use(restify.bodyParser());
//server.use(restify.throttle({
//    burst: 100,
//    rate: 50,
//    ip: true,
//    overrides: {
//        '192.168.1.1': {
//            rate: 0,        // unlimited
//            burst: 0
//        }
//    }
//}));
//server.use(restify.conditionalRequest());


//configure the api & their endpoints
	apis.forEach(function (api) {
    	try {
        	require('./lib/' + api + '.js').setup(server);
   	 	}
    	catch (e) {
        	throw e;
    	}
	});


	//handle server events
	server.on('NotFound', function (req, res, next) {
    	res.send(404, req.url + ' was not found');
    	return next();
	});

//server.pre(function(req,res,next){
//    return next();
//})

	server.on('after', function(req, res, route, error) {
    	var u = url.parse(req.url);
    	log.info(req.connection.remoteAddress + ' ' + req.username + ' ' + req.method + ' ' + u.pathname + ' ' + res.statusCode + ' ' + (res._data?res._data.length:0) );
	});

	//handle server routes
	server.get(/^\/?$/, function (req, res, next) {
    	var u = url.parse(req.url);
    	var base = ''+'//' + req.headers.host;
    	var apiItems = [];
    	@for(var i=0; i<interfaces.length; i++) { 
    	@{var intf = interfaces[i];}
        	var item = {
            	name: '@intf.Name',
            	version: '@(intf.Version().Major)',
        	};
        	item.href = base + config.url_prefix+'/v' + item.version + '/' + item.name.toLowerCase();
        	apiItems.push(item);
    	}
    	res.send(200, apiItems);
    	return next();
	});

	return server;
};

module.exports.createServer = createServer;
module.exports.start = function(server){
	if (server===undefined){
		server= createServer();
	}
	var config = server.config;
	var log = config.logger;
	if (config.clustered) {

    	var cluster = require('cluster'),
        	numCPUs = require('os').cpus().length,
        	windows = require('os').platform() == 'win32';

    	if(cluster.isMaster) {
        	log.info('configuration:', [config]);
        	// Fork workers.
        	for (var i = 0; i < numCPUs; i++) {
            	cluster.fork();
        	}

        	cluster.on('exit', function(worker, code, signal) {
            	log.error('@model.Service-tapi worker %d died code:(%s). restarting...',
                	worker.process.pid, signal || code);
            	cluster.fork();
        	});

        	return;
    	}
	}

	//start listing
	server.listen(config.port, config.ipaddress, function () {
    	log.info('@model.Service-tapi server process (%s) started. Listening on port:%s', process.pid, config.port);
	});
};
