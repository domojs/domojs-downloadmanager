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
            if(!to)
                callback();
            console.log(to);
            $('fs').exists(to, function(exists){
                if(!exists)
                    $('fs').mkdir(to, function(err){
                        if(err)
                        {
                            console.log(err);
                            callback();
                        }
                        var links=findByTagName(dom, 'a');
                        $.each(links, function(index, item){
                            if(!item.attribs.href.startsWith('../'))
                                queue.enqueue({url:$('url').resolve(message.url, item.attribs.href), to:$('path').join(to, decodeURIComponent($('path').basename(item.attribs.href)))});
                        });
                        callback();
    
                    });
                else
                {
                    var links=findByTagName(dom, 'a');
                    $.each(links, function(index, item){
                        if(!item.attribs.href.startsWith('../'))
                            queue.enqueue({url:$('url').resolve(message.url, item.attribs.href), to:$('path').join(to, decodeURIComponent($('path').basename(item.attribs.href)))});
                    });
                    callback();
                }
            })
        }
    });
    var parser = new htmlParser.Parser(handler);
    res.pipe(parser);
};

var download=function(message, callback){
    if(!message || !message.url)
        return callback();
    if(message.auth)
    {
        message.url=$('url').parse(message.url);
        message.url.auth=message.auth;
        message.url=$('url').format(message.url);
    }
    $.ajax(message.url).on('response', function(res){
        if(res.headers['content-type']=='text/html')
        {
            if(res.statusCode==301)
            {
                var url=$('url').parse(message.url);
                queue.enqueue({url:res.headers.location, to:message.to, auth:url.auth});
                callback();
            }
            else
                fastHtmlParse(res, message, callback);
        }
        else
        {
            message.total=res.headers['content-length'];
            message.downloadedSize=0;
            var callbackCalled=false;
            console.log('downloading to '+message.to);
            var file=$('fs').createWriteStream(message.to, {flags:'w', mode:'0666'});
            file.on('error', function(err){
                console.log(err);
                if(!callbackCalled)
                {
                    callbackCalled=true;
                    callback();
                }
            });
            message.lastPercent=0;
            res.pipe(file);
            var fileName=$('path').basename(message.to);
            res.on('data', function(buffer){
                message.downloadedSize+=buffer.length;
                message.progress=message.downloadedSize/message.total;
                if(message.lastPercent<Math.floor(message.progress*1000))
                {
                    message.lastPercent=message.progress*1000;
                    $.emit('download.status', { name:fileName, progress:message.progress, downloadedSize:message.downloadedSize, total:message.total});
                }
            });
            res.on('end', function(){
                $.emit('message', {title:'Download Completed', text:fileName+' download complete'});
                if(!callbackCalled)
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
            callback(200, queue);
        }
        else
            callback(queue);
    }
};