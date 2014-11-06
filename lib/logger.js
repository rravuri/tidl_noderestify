@!(model)

function createLogger(config) {
	var log = {};

	try
	{	  
    	var winston = require('winston');
    	var logSettings = {
        	levels: {
            	trace:  10,
            	debug:  20,
            	info:   30,
            	warn:   40,
            	error:  50,
            	fatal:  60
        	},
        	colors: {
            	trace:  'grey',
            	debug:  'green',
            	info:   'white',
            	warn:   'yellow',
            	error:  'red',
            	fatal:  'magenta'
        	}
    	};

    	winston.addColors(logSettings.colors);
    	var logger = new (winston.Logger)({
        	levels:logSettings.levels,
        	transports: [
            	new (winston.transports.Console)({ level: (config.log.level), colorize:true}),
            	new (winston.transports.File)({ filename: '@model.Service-tapi.log', level: (config.log.level), maxFiles:2, maxsize: (1024*1024*10) })
           	 	]
        	});
    	logger.extend(log);
    	log.trace = function() {
        	if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.trace);
        	logger.trace.apply(logger, arguments);
    	}
    	log.debug = function() {
        	if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.debug);
        	logger.debug.apply(logger, arguments);
    	}
    	log.info = function() {
        	if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.info);
        	logger.info.apply(logger, arguments);
    	}
    	log.warn = function() {
        	if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.warn);
        	logger.warn.apply(logger, arguments);
    	}
    	log.error = function() {
        	if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.error);
        	logger.error.apply(logger, arguments);
   	 	}
    	log.fatal = function() {
       		if (arguments.length==0) return (logSettings.levels[config.loglevel]>=logSettings.levels.fatal);
        	logger.fatal.apply(logger, arguments);
    	}
	}
	catch(e){
		process.stderr.write("Unable to load 'winston' node module.\n");
   		process.stderr.write("\tverify the node module load path.\n");
    	process.stderr.write("\trun ... 'npm install winston' to install the dependencies.\n");
    	process.exit(-1);
	}
	return log;
};
module.exports.create = createLogger;

/**
* Gather some caller info 3 stack levels up.
* See <http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi>.
*/
function getCaller3Info() {
    var obj = {};
    var saveLimit = Error.stackTraceLimit;
    var savePrepare = Error.prepareStackTrace;
    Error.stackTraceLimit = 3;
    Error.captureStackTrace(this, getCaller3Info);
    Error.prepareStackTrace = function (_, stack) {
        var caller = stack[2];
        obj.file = caller.getFileName();
        obj.line = caller.getLineNumber();
        var func = caller.getFunctionName();
        if (func)
            obj.func = func;
    };
    //this.stack;
    Error.stackTraceLimit = saveLimit;
    Error.prepareStackTrace = savePrepare;
    return obj;
}
