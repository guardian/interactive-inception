define([], function() {
    var targetEl;    
    var basePath;
    var htmlPath;

    function httpGet(theUrl, success) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                success(xmlhttp.responseText);
            }
        };
        
        xmlhttp.open("GET", theUrl, false);
        xmlhttp.send();    
    }

    function outputHTML(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var htmlWrapper = document.createElement('div');
        htmlWrapper.classList.add('interactive-external-html');

        // Change relative URLs to absolute
        var elms = doc.querySelectorAll('script, img, link');
        [].forEach.call(elms, function(elm) {
            var src = elm.getAttribute('src');
            if (src && src.indexOf('http') !== 0) {
                console.log(elm, src, basePath);
                elm.setAttribute('src', basePath + src);
            }
            
            var href = elm.getAttribute('href');
            if (href && href.indexOf('http') !== 0) {
                console.log(elm, href, basePath);
                elm.setAttribute('href', basePath + href);
            }
        });

        // Create new script tags to force loading and parsing
        var scriptTags = doc.querySelectorAll('script');
        var scriptsHolder = [];
        [].forEach.call(scriptTags, function(scriptTag) {
            scriptTag.parentNode.removeChild(scriptTag);
            var newScriptEl = document.createElement('script');
            newScriptEl.innerHTML = scriptTag.innerHTML;
            
            var src = scriptTag.getAttribute('src');
            if (src) {
                newScriptEl.setAttribute('src', src);
            }

            scriptsHolder.push(newScriptEl);
        });

        // Remove <link>s and store them
        var linkTags = doc.querySelectorAll('link');
        var linksHolder = [];
        [].forEach.call(linkTags, function(link) {
            linksHolder.push(link.parentNode.removeChild(link)); 
        });
        
        // Inject the new HTML into the page
        htmlWrapper.innerHTML = doc.querySelector('body').innerHTML;
        targetEl.appendChild(htmlWrapper);

        // Add back scripts and links for force loading
        scriptsHolder.forEach(function(scriptEl) {
            htmlWrapper.appendChild(scriptEl);
        });

        linksHolder.forEach(function(linkEl) {
            htmlWrapper.appendChild(linkEl);
        });

   }

    function boot(el) {
        targetEl = el;

        // Silly IE9 doesn't support .dataset :'(
        var bootPath = el.getAttribute('data-interactive');
        if (!bootPath) {
            return console.error('Missing data-interactive path on <figure> el');
        }
        
        basePath = bootPath.substr(0, bootPath.indexOf('boot.js'));
        htmlPath = basePath + 'index.html';
        httpGet(htmlPath, outputHTML);
    }

    return {
        boot: boot
    };
});

