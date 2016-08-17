route.on('download', function(url, params, unchanged){
    var reload=arguments.callee;
    debugger;    
    if(location.hash!='#'+url)
        return;
    $.ajax(loadHtml('download-manager', function(){
        timeout=setTimeout(function(){ reload(url, params, unchanged)}, 2000);
    }));
});