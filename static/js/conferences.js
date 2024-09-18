function updateCards(conferences) {
    const container = $('#conference-cards')
    container.empty()
    conferences.forEach(conf => { addCard(container, conf) })
}
