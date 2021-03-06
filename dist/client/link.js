(function(window, document) {
    var domain = "//lwdgit.github.io/web-clipper/dist/client/";
    if (/^\/\//.test(domain)) {
        domain = window.location.protocol + domain;
    }
    var conf = {
        origin: domain.substr(0, domain.indexOf('/', 8)),//计算host
        base: domain,
        debug: document.scripts[document.scripts.length - 1].src.indexOf('?debug') > 0
    };

    window.addEventListener('message', function(e) {
        if (e.origin === conf.origin) {
            var type = e.data.type, data = e.data.data || '';
            if (type === 'close') {
                CLIP.toggle();
            } else if (type === 'clip') {
                CLIP.doClip(null, 'grabArticle');
            } else if (type === 'cleanTag') {
                CLIP.doClip(data.html, 'grabArticle');
            } else if (type === 'cleanStyle') {
                CLIP.doClip(data.html, 'cleanStyle');
            }
        }
    }, false);

    var CLIP = {
        main_layer: null,
        main_frame: null,
        toggle: function() {
            // console.log('toggle');
            if (!this.main_layer) {
                this.createClipDiv();
            } else {
                this.main_layer.style.display = this.main_layer.style.display === 'none' ? 'block' : 'none';
            }
        },
        loadLib: function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = conf.base + 'bundle.js';
            document.body.appendChild(script);
            script.onload = script.onreadystatechange = function() {
                CLIP.core = _cmd_require('/client/lib/readability.js');
                CLIP.core.debug(conf.debug);//屏蔽log
            }
        },
        createClipDiv: function() {
            var div = document.createElement('div');
            div.style.cssText = 'position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999999999999; display: block; background: #fff;';
            div.id = 'clipper_main_layer';
            div.className = 'clipper-main-layer';
            document.getElementsByTagName('body')[0].appendChild(div);
            this.main_layer = div;
            this.appendIFrame();
        },
        appendIFrame: function() {
            var iframe = document.createElement('iframe');
            iframe.src = conf.base + 'editor/';
            iframe.style.cssText = 'width: 100%;height: 100%';
            this.main_frame = iframe;
            this.main_layer.appendChild(iframe);
        },
        doClip: function(data, functionName) {
            var div = document.createElement('div');
            div.id = '__clipperContent';
            div.innerHTML = data || document.body.innerHTML;

            CLIP.core.prepDocument(document, div);
            var content = CLIP.core[functionName](document, div);
            CLIP.post({
                href: window.location.href,
                content: content,
                title: document.title
            });
            div = null;
        },
        post: function(obj) {
            this.main_frame.contentWindow.postMessage(obj, '*');
        },
        core: null
    };

    CLIP.createClipDiv();
    CLIP.loadLib();

    window.__clipper = CLIP;
}(window, document));