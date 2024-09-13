$('#link-subscribe').click(function(){
    gtag('event', 'subscribe');
});

$('#link-submit').click(function(){
    gtag('event', 'submit_conference');
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

$('#link-sponsor').click(function(){
    gtag('event', 'mailto_sponsor');
});

$('#link-contact').click(function(){
    gtag('event', 'mailto_contact');
});

$('#link-reddit').click(function(){
    gtag('event', 'reddit');
});


$('#link-github').click(function(){
    gtag('event', 'github');
});
