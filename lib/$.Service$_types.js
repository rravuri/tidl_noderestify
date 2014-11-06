@!(model, intf)
var @(model.Service.toLowerCase()) = {};
module.exports = @(model.Service.toLowerCase());

@for(var i=0; i<model.Types.length; i++) { 
	@{ var typ=model.Types[i]; 
		var typPrms=Object.getOwnPropertyNames(typ.Parameters);}
		
@(model.Service.toLowerCase()).@(typ.Name) = function _@(typ.Name)() {
	var that={};
	@for(var p=0;p<typPrms.length;p++){ 
		@{var prm=typ.Parameters[typPrms[p]];}
	this.@(prm.Name)=null;
	}
	return that;
}

}