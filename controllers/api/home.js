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
    if(!message || !message.url)
        return callback();
    $.ajax(message.url).on('response', function(res){
        if(res.headers['content-type']=='text/html')
        {
            fastHtmlParse(res, message, callback);
        }
        else
        {
            message.total=res.headers['content-length'];
            message.downloadedSize=0;
            var file=$('fs').createWriteStream(message.to);
            file.on('error', function(err){
                console.log(err);
                callback();
            });
            message.lastPercent=0;
            res.pipe(file);
            res.on('data', function(buffer){
                message.downloadedSize+=buffer.length;
                message.progress=message.downloadedSize/message.total;
                if(message.lastPercent<Math.floor(message.progress*1000))
                {
                    message.lastPercent=message.progress*1000;
                    $.emit('download.status', { progress:message.progress, downloadedSize:message.downloadedSize, total:message.total});
                }
            });
            res.on('end', function(){
                $.emit('message', 'Download Completed');
                
                callback();
            });
        }
    });
};

var queue=new Queue(download, './modules/download-manager/queue.json');

module.exports={
    get:function(url, to, callback){
        if(typeof(url)!='undefined')
        {
            queue.enqueue({url:url, to:to});
            callback(200);
        }
        else
            callback(queue);
    }
};