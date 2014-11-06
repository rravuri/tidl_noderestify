@!(model, intf)

var @intf.Name.toLowerCase() = {};
module.exports = @intf.Name.toLowerCase();

@(intf.Name.toLowerCase()).setup = function @(intf.Name.toLowerCase())_setup(server) {
	var config=server.config;
	var log=config.logger;
    var notImplementedHandler = function (req, res, next) {
        return next("NotImplemented");
    };
    
    var impl = null;
    try {
        if (config && config.@(intf.Name.toLowerCase()) && config.@(intf.Name.toLowerCase()).impl){
            try {
                 impl = require(config.@(intf.Name.toLowerCase()).impl);
            }
            catch(e){
                console.log('Warning '+config.@(intf.Name.toLowerCase()).impl+' file not found.'+e);
            }
        }
        if (impl===null)
            impl = require('./@(intf.Name.toLowerCase())_impl.js');
    }
    catch (e) {
        console.log('Warning ./@(intf.Name.toLowerCase())_impl.js file not found. All opeartions for api @(intf.Name.toLowerCase()) will return 501 Not Implemented.');
    }

    var endpoints = [
        @for(var i=0; i<intf.Operations.length; i++) { 
        @{ 
            var op=intf.Operations[i]; 
            var ep=op.getAttribute('restendpoint').Values;
            var prms=[];
            Object.getOwnPropertyNames(op.Parameters).forEach(function(prmName){
                prms.push(op.Parameters[prmName]);
            });     
        }       
        {
            method: "@(ep[0].toLowerCase())",
            path: config.url_prefix + "/@(ep[1].replace(/\{/g,':').replace(/\}/g,''))",
            name: "@(op.Name)",
            handler: function(req, res, next) {
                var actualHandler = notImplementedHandler;
                if (impl && impl.@(op.Name)) {
                    actualHandler = impl.@(op.Name);
                }
                else {
                    return actualHandler(req, res, next);
                }

                var returnFn = function(err, result){
                    if (err!==null) return next(err);
					if (result===undefined) return next();
					
					res.send(200, result);
                    res.end();
                };
                var args=[];
                @for(var p=0;p<prms.length;++p){
                    args.push(@((ep[3]==prms[p].Name)?'req.body':("req.params."+prms[p].Name.toLowerCase())));
                }
                args = args.concat([req, res, returnFn]);
                var ret = actualHandler.apply(impl, args);
                if (ret !== undefined) {
					res.send(200, ret);
					res.end();
                }
            }
        },

        }
    ];



    endpoints.forEach(function (endpoint) {
        server[endpoint.method](endpoint, endpoint.handler);
    });
};
