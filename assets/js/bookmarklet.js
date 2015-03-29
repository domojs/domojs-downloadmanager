(function()
{
    var queueDownload=true;
    var links=document.getElementsByTagName('A');
    var popup=document.createElement('div');
    popup.style.position='fixed';
    popup.style.top='20px';
    popup.style.right='20px';
    var cb=document.createElement('input');
    cb.type='checkbox';
    cb.addEventListener('change', function(){
        queueDownload=cb.checked;
    });
    cb.checked=queueDownload;
    popup.appendChild(cb);
    
    document.body.appendChild(popup);
    for(var i=0; i<links.length;i++)
    {
        var link=links[i];
        link.addEventListener('click', function(ev){
            if(queueDownload)
            {
                ev.preventDefault();
                var xhr=new XMLHttpRequest();
                xhr.onreadystatechange = function() { 
                    if(xhr.readyState == 4) 
                        alert('Download queued'); 
                }
                
                var src=this.pathname;
                xhr.open('GET', 'http://mediacenter/api/download-manager/?url='+encodeURIComponent('http://neonp:uagq4h6t@torrents.cloudapp.net'+src)+'&to=/mnt/Dropbox'+encodeURIComponent(src));
                xhr.send();
                
            }
        });
    };
})();