const website = "bconf.org"

function addCard(container, conf) {
    $.get('/static/html/conference_card.html', function (cardHTML) {
        let card = $(cardHTML);
        let [googleCalUrl, appleCalUrl] = getCalendarURLs(conf);

        if (conf.SponsoredType) {
            card.find('.card-front').addClass('card-sponsored');
            card.find('.card-back').addClass('card-sponsored');
            card.find('#conference-sponsored').addClass('d-block')
        } else {
            card.find('#conference-sponsored').addClass('d-none')
        }

        // front
        card.find('.card-front').css('background-image', `url(${conf.PictureUrl})`);
        card.find('#conference-name').text(conf.Name);
        card.find('#conference-dates').text(getDatesRange(conf));
        card.find('#conference-city').text(conf.Location.split(", ")[0]);
        card.find('#conference-country').html(`${conf.Location.split(", ")[1]} <span style="font-size: 1.7em; position: relative; top: 3px;">${conf.Flag}</span>`);

        // back
        card.find('.card-back').css('background-image', `url(${conf.PictureUrl})`);
        card.find('#conference-calendar-google').attr('href', googleCalUrl);
        card.find('#conference-calendar-apple').attr('href', appleCalUrl);
        card.find('#conference-calendar-apple').attr('download', `${conf.Name}.ics`);
        card.find('#conference-url').attr('href', getUTMedURL(conf));

        container.append(card);
    });
}

function getUTMedURL(conf) {
    return `${conf.Url}?utm_source=${website}&utm_medium=referral&utm_campaign=bitcoin_conference_listing`
}

function getDatesRange(conf) {
    const [startYear, startMonth, startDay] = parseDate(conf.StartDate);
    const startMonthShort = getShortMonth(startMonth)
    if (conf.EndDate) {
        const [endYear, endMonth, endDay] = parseDate(conf.EndDate);
        const endMonthShort = getShortMonth(endMonth)

        if (conf.StartDate === conf.EndDate) {
            return `${startMonthShort} ${startDay}, ${startYear}`;
        } else if (startYear !== endYear) {
            return `${startMonthShort} ${startDay}, ${startYear} - ${endMonthShort} ${endDay}, ${endYear}`;
        } else if (startMonth !== endMonth) {
            return `${startMonthShort} ${startDay} - ${endMonthShort} ${endDay}, ${endYear}`;
        } else {
            return `${startMonthShort} ${startDay}-${endDay}, ${startYear}`;
        }
    } else {
        return `${startMonthShort} ${startDay}, ${startYear}`;
    }
}

function getCalendarURLs(conf) {
    const title = conf.Name;
    const description1 = `Join us for a Bitcoin conference in ${conf.Location}. More details here ${getUTMedURL(conf)}.`;
    const description2 = `Stay updated with all the latest Bitcoin conferences by subscribing to our calendar at https://${website}/#subscription.`;

    const startDate = formatStartDateForCal(conf.StartDate);
    const endDate = conf.EndDate ? formatEndDateForCal(conf.EndDate) : formatEndDateForCal(conf.StartDate);
    const location = conf.Location;
    const tz = conf.Tz;

    // GOOGLE
    const descriptionGoogle = `${description1}
    
${description2}`;
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(descriptionGoogle)}&dates=${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}&location=${encodeURIComponent(location)}&sprop=website:${encodeURIComponent(website)}`

    // APPLE
    const descriptionApple = `${description1} ${description2}`;
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=${tz}:${startDate}
DTEND;TZID=${tz}:${endDate}
SUMMARY:${title}
DESCRIPTION:${descriptionApple}
LOCATION:${location}
END:VEVENT
END:VCALENDAR
            `.trim();

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const appleUrl = URL.createObjectURL(blob);

    return [googleUrl, appleUrl];
}

function formatStartDateForCal(startDateString) {
    const [year, month, day] = parseDate(startDateString);
    const fmonth = String(month).padStart(2, '0');
    const fday = String(day).padStart(2, '0');
    return `${year}${fmonth}${fday}`;
}

function formatEndDateForCal(endDateString) {
    const date = new Date(endDateString)
    date.setDate(date.getDate() + 2); // add one day to display in Google Cal correctly
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function parseDate(dateString) {
    const parts = dateString.split('-');

    if (parts.length !== 3) {
        throw new Error('Invalid date format. Expected format: YYYY-MM-DD');
    }

    const [year, month, day] = parts.map(Number);

    if (
        isNaN(year) || isNaN(month) || isNaN(day) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
    ) {
        throw new Error('Invalid date components.');
    }

    return [year, month, day];
}

function getShortMonth(month) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]
}

$(function () {
    $(document).on('click', '.conference-card .card-back .btn', function (event) {
        event.stopPropagation(); // Prevents the flip on button clicks
    });
    $(document).on('click', '.card-container', function (e) {
        // Only flip the card if the clicked target is not a button
        if (!$(e.target).closest('.btn').length) {
            $(this).toggleClass('flipped');
        }
    });
});
