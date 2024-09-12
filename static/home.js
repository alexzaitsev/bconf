const website = "bconf.org"
const width = 800;
const height = 450;
const regularColor = "#75706f";
const hoverColor = "#fec008";
const selectedColor = "#f7931a";
const strokeColor = "#f3f3f3"

var color = d3.scaleOrdinal();

var graticule = d3.geoGraticule();
var svg = d3.select("#world-map");

//https://bl.ocks.org/mbostock/3710082
var projection = d3.geoKavrayskiy7()
    .scale(150)
    .translate([width / 2, height / 2])
    .precision(.1)
    .rotate([-11, 0]);

var path = d3.geoPath().projection(projection);
var data = "https://piwodlaiwo.github.io/topojson//world-continents.json";

let selectedContinent = null;

d3.json(data, function (error, topology) {
    var continents = topojson.feature(topology, topology.objects.continent).features;
    svg.selectAll(".continent")
        .data(continents)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", strokeColor)
        .style("stroke-width", 0.3)
        .style("fill", regularColor)
        .on("mouseover", function (d, i) {
            if (d.properties.continent != selectedContinent) {
                d3.select(this).style("fill", hoverColor);
            }
        })
        .on("mouseout", function (d, i) {
            if (d.properties.continent != selectedContinent) {
                d3.select(this).style("fill", regularColor);
            }
        })
        .on("click", function (d, i) {
            // Deselect previously selected continent
            d3.selectAll("path")
                .filter(function (d) {
                    return d.properties.continent === selectedContinent;
                })
                .style("fill", regularColor);

            if (selectedContinent != d.properties.continent) {
                // Select the clicked continent if it was not selected (allowing deselect functionality)
                selectedContinent = d.properties.continent
                d3.select(this).style("fill", selectedColor);
                gtag('event', 'map_continent_select', { 'continent': selectedContinent });
            } else {
                // deselect
                gtag('event', 'map_continent_deselect', { 'continent': selectedContinent });
                selectedContinent = null
            }
            updateMap()
            updateTable()
        });
})

function updateMap() {
    svg.selectAll(".conference-pin").remove(); // Clear existing dots
    const filtered = selectedContinent === null
        ? conferences
        : conferences.filter(conf => conf.Continent === selectedContinent)

    const coords = filtered
        .filter(conf => conf.Coords)
        .map(conf => conf.Coords)

    coords.forEach(coords => {
        svg.append("circle")
            .attr("class", "conference-pin")
            .attr("transform", function (d) {
                return "translate(" + projection([coords.longitude, coords.latitude]) + ")";
            })
            .attr("r", 3); // Radius of the dot
    });

    const conferenceWord = (filtered.length === 1) ? "conference" : "conferences";
    const title1 = `Explore <span>${filtered.length} </span>Bitcoin ${conferenceWord}<br>`
    if (selectedContinent) {
        document.getElementById('main-title').innerHTML = `${title1}<span>in ${selectedContinent}</span>`
    } else {
        document.getElementById('main-title').innerHTML = `${title1}<span>worldwide</span>`
    }
}


function updateTable() {
    const tableHead = document.getElementById('conf-table-head');
    tableHead.innerHTML = '';
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="col">Event</th>
        <th scope="col"><i class="fa-solid fa-location-dot"></i> Location</th>
        ${selectedContinent == null ? '<th class="d-none d-md-table-cell">Continent</th>' : ''}
        <th scope="col">Dates</th>
        <th scope="col" style="min-width: 120px; max-width: 150px;"><i class="fa-regular fa-calendar-plus"></i> Add to calendar</th>
    `
    tableHead.appendChild(row);

    const tableBody = document.getElementById('conf-table-body');
    tableBody.innerHTML = '';

    const filteredConferences = selectedContinent === null
        ? conferences
        : conferences.filter(conf => conf.Continent === selectedContinent);

    filteredConferences.forEach(conf => {
        const row = document.createElement('tr');
        const tdContinent = selectedContinent == null ? `<td class="d-none d-md-table-cell">${conf.Continent}</td>` : ''
        row.innerHTML = `
            <td><a class="link-conference" href="${getUTMedURL(conf)}" target="_blank">${conf.Name}</a></td>
            <td>${conf.Location}</td>
            ${tdContinent}
            <td>${getDataRange(conf)}</td>
            <td>${getAddToCalendar(conf)}</td>
        `;
        tableBody.appendChild(row);
    });

    if (filteredConferences.length == 0) {
        document.getElementById('conf-table').classList.remove('d-block');
        document.getElementById('conf-table').classList.add('d-none');
    } else {
        document.getElementById('conf-table').classList.remove('d-none');
        document.getElementById('conf-table').classList.add('d-block');
    }
    clearSelection();
}

function getUTMedURL(conf) {
    return `${conf.Url}?utm_source=${website}&utm_medium=referral&utm_campaign=bitcoin_conference_listing`
}

function getDataRange(conf) {
    const [startYear, startMonth, startDay] = parseDate(conf.StartDate);
    const fullStartMonth = getFullMonth(startMonth)
    if (conf.EndDate) {
        const [endYear, endMonth, endDay] = parseDate(conf.EndDate);
        const fullEndMonth = getFullMonth(endMonth)

        if (conf.StartDate === conf.EndDate) {
            return `${fullStartMonth} ${startDay}, ${startYear}`;
        } else if (startYear !== endYear) {
            return `${fullStartMonth} ${startDay}, ${startYear} - ${fullEndMonth} ${endDay}, ${endYear}`;
        } else if (startMonth !== endMonth) {
            return `${fullStartMonth} ${startDay} - ${fullEndMonth} ${endDay}, ${startYear}`;
        } else {
            return `${fullStartMonth} ${startDay}-${endDay}, ${startYear}`;
        }
    } else {
        return `${fullStartMonth} ${startDay}, ${startYear}`;
    }
}

function getAddToCalendar(conf) {
    const title = conf.Name
    const description1 = `Join us for a Bitcoin conference in ${conf.Location}. More details here ${getUTMedURL(conf)}.`
    const description2 = `Stay updated with all the latest Bitcoin conferences by subscribing to our calendar at https://${website}/#subscription-form.`
    const descriptionGoogle = `${description1}
    
${description2}`
    const descriptionApple = `${description1} ${description2}`
    const startDate = formatStartDateForCal(conf.StartDate)
    const endDate = conf.EndDate ? formatEndDateForCal(conf.EndDate) : formatEndDateForCal(conf.StartDate)
    const location = conf.Location
    const tz = conf.Tz

    // GOOGLE
    const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(descriptionGoogle)}&dates=${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}&location=${encodeURIComponent(location)}&sprop=website:${encodeURIComponent(website)}`
    const googleHTML = `<a href="${link}" target="_blank"><i class="fa-brands fa-google"></i></a>`

    // APPLE
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
    const url = URL.createObjectURL(blob);
    const appleHTML = `<a href="${url}" download="${title}.ics"><i class="fa-brands fa-apple"></i></a>`;

    // COMBINE
    return `<div>
                <button type="button" class="link-conference-calendar-google btn btn-outline-dark">${googleHTML}</button>
                <button type="button" class="link-conference-calendar-apple btn btn-outline-dark">${appleHTML}</button>
            </div`
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

function getFullMonth(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1]
}

updateTable()

document.addEventListener("DOMContentLoaded", function (e) {
    // Wait until the paths are appended
    const interval = setInterval(() => {
        const pathExists = svg.selectAll("path").size() > 0;
        if (pathExists) {
            clearInterval(interval);
            updateMap()
        }
    }, 100); // Check every 100ms
});

function clearSelection() {
    if (window.getSelection) {
        var selection = window.getSelection();
        if (selection.removeAllRanges) {
            selection.removeAllRanges();
        }
    } else if (document.selection) { // For older IE browsers
        document.selection.empty();
    }
}