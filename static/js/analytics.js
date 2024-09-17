$('#link-subscribe').click(function(){
    gtag('event', 'subscribe');
});

$('#link-submit-banner').click(function(){
    gtag('event', 'submit_conference_banner');
});

$('.link-conference').click(function(){
    gtag('event', 'table_conference_url_click');
});

$('.link-conference-calendar-google').click(function(){
    gtag('event', 'table_conference_calendar_google_click');
});

$('.link-conference-calendar-apple').click(function(){
    gtag('event', 'table_conference_calendar_apple_click');
});

$('#subscription').click(function(){
    gtag('event', 'iframe_subscribe');
});

$('#link-sponsor').click(function(){
    gtag('event', 'mailto_sponsor');
});

$('#link-contact').click(function(){
    gtag('event', 'mailto_contact');
});

$('#link-submit-bottom').click(function(){
    gtag('event', 'submit_conference_bottom');
});

$('#link-github').click(function(){
    gtag('event', 'github');
});
