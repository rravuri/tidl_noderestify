@!(model, intf)
@{
	function jsval(s,t){ 
		if (s=='null') return s; 
		return JSON.stringify(s);
	}
}

var @(model.Service.toLowerCase())Types = require('./@(model.Service.toLowerCase())_types.js');

var @(intf.Name.toLowerCase()) = {};

module.exports = @(intf.Name.toLowerCase());

@for(var i=0; i<intf.Types.length; i++) { 
	@{ 
		var typ=intf.Types[i]; 
		var typPrms=Object.getOwnPropertyNames(typ.Parameters);
	}
@(intf.Name.toLowerCase()).@(typ.Name) = function _@(typ.Name)() {
	var that={};
	@for(var p=0;p<typPrms.length;p++){ 
		@{
			var prm=typ.Parameters[typPrms[p]];
			var ta=typ.getAttribute('parameter',typPrms[p]);
		}
	that.@(prm.Name)=@((ta!=null && ta.Values.length>2)?jsval(ta.Values[2]):'null');
	}
	return that;
};


@(intf.Name.toLowerCase()).@(typ.Name).prototype.dummy = function _dummy() {
	var d=new @(intf.Name.toLowerCase()).@(typ.Name)();
	@for(var p=0;p<typPrms.length;p++){ 
		@{var prm=typ.Parameters[typPrms[p]];var ta=typ.getAttribute('parameter',typPrms[p]);}
	d.@(prm.Name)=@((ta!==null && ta.Values.length>3)?jsval(ta.Values[3]):'null');
	}
	return d;
};

}@*for all interfaces*@
