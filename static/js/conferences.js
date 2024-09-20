let preloadedCardHTML = '';
let isTemplateLoading = false;

function loadTemplate(callback) {
    if (preloadedCardHTML === "" && !isTemplateLoading) {
        isTemplateLoading = true;
        $.get('/static/html/conference_card.html', function (data) {
            preloadedCardHTML = data;
            isTemplateLoading = false; // Reset the flag once the template is loaded
            callback();
        }).fail(function () {
            isTemplateLoading = false; // Reset the flag in case of an error
            console.error("Failed to load the template");
        });
    } else if (preloadedCardHTML !== "") {
        // If the template is already loaded, call the callback immediately
        callback();
    }
}

function updateCards(conferences) {
    const container = $('#conference-cards');
    container.empty();

    loadTemplate(function () {
        conferences.forEach(conf => {
            addCard(container, preloadedCardHTML, conf);
        });
    });
}
