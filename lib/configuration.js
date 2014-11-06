@!(model)
@{
    var interfaces=[];
    Object.getOwnPropertyNames(model.Interfaces).forEach(function(intfName){
        interfaces.push(model.Interfaces[intfName]);
    });         
}
var defaultconfig={
    url_prefix:"/api",
    log:{
    	level: "warning"
	},
    ipaddress : process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
    port:(process.env.OPENSHIFT_NODEJS_PORT||(process.env.PORT||8088)),
    clustered: false
};
var config = {}, cfg={};
try{
    var cfg=require('../config.js');
}
catch(e){
    process.stderr.write('Warning: config.js not found. Using default configuration.\n');
}
    config.url_prefix = (cfg.url_prefix!=undefined?cfg.url_prefix:defaultconfig.url_prefix).toLowerCase();
    config.clustered = cfg.clustered||defaultconfig.clustered;
    config.ipaddress = cfg.ipaddress||defaultconfig.ipaddress;
    config.port = cfg.port||defaultconfig.port;
    config.log = cfg.log||defaultconfig.log;
    config.log.level = config.log.level||defaultconfig.log.level;
    @for(var i=0; i<interfaces.length; i++) 
        { @{intf = interfaces[i]}
    config.@(intf.Name.toLowerCase())=(cfg.@(intf.Name.toLowerCase())||config.@(intf.Name.toLowerCase()));
    }

module.exports=config;


/*---- config.js syntax -------
var config = {};
module.exports = config;

config.url_prefix='/api';
config.log={ level:'trace'};

config.interfacename={
	impl:'./new_impl.js'
}

------------------------------*/
