var api=require('./api/home.js');

function emptyUrlCredentials(url){
    url=$('url').parse(url);
    url.auth=null;
    return $('url').format(url);
}

module.exports={
    get:function(){
        var self=this;
        api.get(undefined,undefined, function(queue){
            var queueView={};
                queueView.current=queue.current && {url:emptyUrlCredentials(queue.current.url), progress:queue.progress*100};
            queueView.pending=queue.pending;
            self.view(queue, $('url'));
        });
    },
    
};