
global.Queue=function(processor, a2)
{
    var processing=false;
    var queue=this.pending=a2 || [];
    console.log(processor);
    this.enqueue=function(message){
        console.log(message);
        queue.push(message);
        processQueue();
    };
    
    var processQueue=function(){
        if(processing)
            return;
        processing=true;
        var message=queue.shift();
        if(!message)
            return processing=false;
        processor(message, function(){ processing=false; processQueue(); });
    };
};

var findByTagName=function(dom, tagName)
{
    var result=[];
    if(dom.length>0)
    {
        for(var i in dom)
        {
            if(dom[i].name == tagName)
            {
                result.push(dom[i]);
            }
            if(typeof(dom[i].children)!='undefined')
            {
                //console.log(dom[i]);
                result=result.concat(findByTagName(dom[i].children, tagName));
            }
        }
    }
    return result;
};

var fastHtmlParse=function(res, message, callback)
{
    var doc='';
    var htmlParser=require('htmlparser2');
    var handler = new htmlParser.DefaultHandler(function (error, dom) {
    if (error)
        console.log(error);
    else
        {
            var folderName=$('path').basename(message.url);
            
            var to=message.to;
            console.log(to);
            $('fs').mkdir(to, function(err){
                if(err)
                {
                    console.log(err);
                    return callback();
                }
                var links=findByTagName(dom, 'a');
                $.each(links, function(index, item){
                    if(!item.attribs.href.startsWith('../'))
                        queue.enqueue({url:$('url').resolve(message.url, item.attribs.href), to:$('path').join(to, decodeURIComponent($('path').basename(item.attribs.href)))});
                });
                callback();
            });
        }
    });
    var parser = new htmlParser.Parser(handler);
    res.pipe(parser);
};

var download=function(message, callback){
    console.log(message);
    $.ajax(message.url).on('response', function(res){
        if(res.headers['content-type']=='text/html')
        {
            fastHtmlParse(res, message, callback);
        }
        else
        {
            res.pipe($('fs').createWriteStream(message.to));
            res.on('end', callback);
        }
    });
};

var queue=new Queue(download);

$('fs').exists('./download-manager/queue.json', function(exists){
    if(exists)
        queue=new Queue(download, $('./download-manager/queue.json'));
});

module.exports={
    get:function(url, to, callback){
        if(typeof(url)!='undefined')
        {
            queue.enqueue({url:url, to:to});
            callback(200);
        }
        else
            callback(queue.pending);
    }
};