(function(){
    var $module=$('<li class="dropdown"><a href class="dropdown-toggle hidden-xs" style="padding-top:15px; padding-bottom:0;height:54px;display:block" data-toggle="dropdown" role="button" aria-expanded="false">\
                    <div style="height:5px;width:200px;margin-bottom:5px;" class="progress">\
                        <div class="progress-bar text-art-tertiary" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 0;">\
                        </div>\
                    </div>\
                    <span class="progress-text" style="display:inline-block; width:185px; text-align:center"></span><span class="caret"></span></a>\
                    <ul class="dropdown-menu" role="menu">\
                        <li class="downloaded-size"></li>\
                        <li class="name"></li>\
                    </ul>\
                    </li>');
    $module.hide();
    var timeout=false;
    function humanReadable(size)
    {
        var n=0;
        while(size>1500)
        {
            size/=1024;
            n++;
        }
        size=Math.round(size,2);
        switch(n)
        {
            case 0:
                size+=' o';
                break;
            case 1:
                size+=' ko';
                break;
            case 2:
                size+=' Mo';
                break;
            case 3:
                size+=' Go';
                break;
        }
            return size;
    }
    
    socket.on('download.status', function(status){
        if(status.progress)
        {
            if(timeout)
                clearTimeout(timeout);
            
            $('.downloaded-size', $module).text(humanReadable(status.downloadedSize)+' / '+humanReadable(status.total));
            $('.name', $module).text(status.name);
            var progressPercent=Math.round(status.progress*10000)/100;
            $('.progress-text', $module).text(progressPercent+' %');
            $('.progress-bar', $module).width(progressPercent-5+'%');
            $module.show();
            timeout=setTimeout(function(){
                $module.hide();
            }, 120000);
        }
        if(status.progress==100)
        {
            $.gritter.add('Download completed');
            $module.hide();
        }
    });
    $('#modulePlaceHolder').prepend($module);
})();

