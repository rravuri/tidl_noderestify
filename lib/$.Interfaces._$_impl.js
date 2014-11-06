@!(model, intf)
var @(model.Service.toLowerCase())Types = require('./@(model.Service.toLowerCase())_types.js');
var @(intf.Name.toLowerCase())Types = require('./@(intf.Name.toLowerCase())_types.js');

var @(intf.Name.toLowerCase()) = {};
module.exports = @(intf.Name.toLowerCase());
@for(var i=0; i<intf.Operations.length; i++) { 
	@{ 
		var op=intf.Operations[i]; 
		var ep=op.getAttribute('restendpoint').Values;
	 	var prms=[];
	    Object.getOwnPropertyNames(op.Parameters).forEach(function(prmName){
	        prms.push(op.Parameters[prmName]);
	    }); 
     }
@if (op.Name=='_status'){
@(intf.Name.toLowerCase()).@(op.Name) = function _@(op.Name)(	
		_req, _res, _next
	) {
	var status = @(intf.Name.toLowerCase())Types._APIStatus();
	status.status = 'ok';
	return _next(null, status);
};
}
else {
@(intf.Name.toLowerCase()).@(op.Name) = function _@(op.Name)(
	@for(p=0;p<prms.length;p++){
		@(prms[p].Name) , //@(prms[p].Type.Name)
	}	
		_req, _res, _next
	) {
	@if (op.Name=='_interface'){
	return _next(null,@(JSON.stringify(model)));
	}
	else {
	return _next("NotImplemented '@(intf.Name.toLowerCase())' api did not implement '@(op.Name)'.");
	}
};
}
}
