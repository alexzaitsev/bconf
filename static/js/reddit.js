$(function () {
    function resizeIframe() {
        $('#reddit iframe').css({
            'width': '100%',
            'max-width': '100%'
        });
    }

    var redditDiv = $('#reddit');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            $(mutation.addedNodes).each(function () {
                if (this.tagName === 'IFRAME') {
                    resizeIframe();
                }
            });
        });
    });
    observer.observe(redditDiv[0], { childList: true });
    resizeIframe();
});