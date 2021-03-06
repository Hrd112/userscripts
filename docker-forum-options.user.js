// ==UserScript==
// @name        Docker Forum Options
// @namespace   http://stackoverflow.com/users/982924/rasg
// @author      RASG
// @description Add options to forums.docker.com to (1) expand code box, (2) resize code font size, (3) expand answer box
// @require     http://code.jquery.com/jquery.min.js
// @require     https://raw.github.com/odyniec/MonkeyConfig/master/monkeyconfig.js
// @require     https://cdn.jsdelivr.net/npm/siiimple-toast/dist/siiimple-toast.min.js
// @resource    toastcss  https://cdn.jsdelivr.net/npm/siiimple-toast/dist/style.css
// @include     http*://forums.docker.com/*
// @icon        https://www.google.com/s2/favicons?domain=forums.docker.com
// @version     2020.01.17.1331
// @grant       GM_addStyle
// @grant       GM_getMetadata
// @grant       GM_getResourceText
// @grant       GM_getValue
// @grant       GM_notification
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

// -----------------------------------------------------------------------------
// LOAD TOAST NOTIFICATIONS LIBRARY
// -----------------------------------------------------------------------------

// @require     https://cdn.jsdelivr.net/npm/siiimple-toast/dist/siiimple-toast.min.js
// @resource    toastcss  https://cdn.jsdelivr.net/npm/siiimple-toast/dist/style.css
// @grant       GM_addStyle
// @grant       GM_getResourceText

GM_addStyle( GM_getResourceText("toastcss") );

var toast = siiimpleToast.setOptions({
    position: 'top|right',
    duration: 3000,
});

// -----------------------------------------------------------------------------
// PREVENT JQUERY CONFLICT
// -----------------------------------------------------------------------------

var $      = window.$;
var jQuery = window.jQuery;

this.$ = this.jQuery = jQuery.noConflict(true);

if (typeof $ == 'undefined') console.log('JQuery not found; The script will certainly fail');

// -----------------------------------------------------------------------------
// OPTIONS / CONFIG MENU
// -----------------------------------------------------------------------------

var parametros = {
    code_box_expand  : { type: 'checkbox', default: true },
    code_box_height  : { type: 'number',   default: 900 },
    code_font_resize : { type: 'checkbox', default: true },
    code_font_size   : { type: 'number',   default: 12 },
    hide_page_header : { type: 'checkbox', default: false },
    page_wide        : { type: 'checkbox', default: true },
};

var cfg;
try {
    cfg = new MonkeyConfig({
        title:       'Config DF_code_box',
        menuCommand: true,
        onSave:      function() { fnSaveChanges(); },
        params:      parametros
    });
    console.log("MonkeyConfig loaded; The settings menu will be enabled");
}
catch(err) {
    console.log(err);
    console.log("MonkeyConfig not loaded; The settings menu will be disabled");
    cfg = {
        params: parametros,
        get:    function get(name) { return GM_getValue(name, this.params[name].default) }
    }
}

// -----------------------------------------------------------------------------
// START
// -----------------------------------------------------------------------------

var shouldreload = false;

// apply imediately at document start
fnCheckChanges();

// also wait for page load. jquery will be ready here
$(function() {

    // monitor the page for changes and reapply if necessary
    // use 'observer.disconnect()' in 'fnCheckChanges()' to stop monitoring
    var alvo = document.querySelector('body');
    var observer = new MutationObserver(fnCheckChanges);
    observer.observe(alvo, { attributes: true, characterData: true, childList: true, subtree: true });

});

// -----------------------------------------------------------------------------
// FUNCTIONS
// -----------------------------------------------------------------------------

function fnCheckChanges(changes, observer) {

    var code_box_height = '';
    if (cfg.get("code_box_expand")) code_box_height = cfg.get("code_box_height") + 'px';
    $('code').css({'max-height':code_box_height});

    var code_font_size = '';
    if (cfg.get("code_font_resize")) code_font_size = cfg.get("code_font_size") + 'px';
    $('blockquote, code, pre').css({'font-size':code_font_size});

    var pageheader = $('header.header');
    if ( cfg.get("hide_page_header") ) {
        pageheader.hide();
    }
    else {
        pageheader.css({'height':'100px'});
        pageheader.show();
    }

    var page_size = '';
    var cp_size   = '';
    var tl_margin = '';
    var tb_float  = '';
    var tb_margin = '';
    var tb_width  = '';
    if (cfg.get("page_wide")) {
        page_size = 'unset';
        cp_size   = 'unset';
        tl_margin = '90%';
        tb_float  = 'unset';
        tb_margin = '10%';
        tb_width  = 'unset';
    }
    $('.wrap').css({'max-width':page_size});
    $('.container.posts').css({'width':cp_size});
    $('.timeline-container').css({'margin-left':tl_margin});
    $('.topic-body').css({'float':tb_float, 'margin-right':tb_margin, 'width':tb_width});
}

// -----------------------------------------------------------------------------

function fnSaveChanges() {

    $('body').on("click", "#reloadnow", function() {
        $(this).fadeOut("fast", function() { document.location.reload(false); });
    });

    var msg_success = 'Settings saved';
    toast.success(msg_success);

    var msg_reload = '<span id="reloadnow"> Some changes will be applied after you reload the page. <br> Click here to reload now </span>';
    if (shouldreload) toast.message(msg_reload, { delay: 3000, duration: 7000 });
}
