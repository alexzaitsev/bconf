const ANALYTICS_PREFIX_CLICK = 'v2_click';

$('.analytics-top-subscribe').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_top_subscribe`);
});

$('.analytics-banner-submit').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_banner_submit`);
});

$('.card-front').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_card_front`);
});

$('.card-back').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_card_back`);
});

$('.analytics-card-cta').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_card_website`);
});

$('.analytics-card-google-cal').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_card_google_cal`);
});

$('.analytics-card-apple-cal').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_card_apple_cal`);
});

$('.analytics-iframe-subscription').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_iframe_subscribe`);
});

$('.analytics-footer-sponsor').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_footer_sponsor`);
});

$('.analytics-footer-contact-us').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_footer_contact_us`);
});

$('.analytics-footer-submit').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_footer_submit`);
});

$('.analytics-github').click(function(){
    gtag('event', `${ANALYTICS_PREFIX_CLICK}_github`);
});
