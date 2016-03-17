route.on('download', function(url, params, unchanged){
    var reload=arguments.callee;
    $.ajax(loadHtml('download-manager', function(){
        setTimeout(function(){ reload(url, params, unchanged)}, 2000);
    }));
});