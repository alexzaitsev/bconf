const width = 800;
const height = 450;
const regularColor = $(":root").css("--color-dark-bg").trim();
const hoverColor = "rgba(247, 147, 26, 0.75)"; // --color-dark-attention, 75% opacity
const selectedColor = $(":root").css("--color-dark-attention").trim();
const borderColor = $(":root").css("--color-dark-contrast").trim();

let selectedContinent = null;
let firstLoad = true;

let svg = d3.select("#world-map");
let projection = d3.geoKavrayskiy7()
    .scale(150)
    .translate([width / 2, height / 2])
    .precision(.1)
    .rotate([-11, 0]);
d3.json("https://piwodlaiwo.github.io/topojson//world-continents.json", function (error, topology) {
    var continents = topojson.feature(topology, topology.objects.continent).features;
    svg.selectAll(".continent")
        .data(continents)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", borderColor)
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "4,2")
        .style("fill", regularColor)
        .on("mouseover", function (d, i) {
            if (d.properties.continent != selectedContinent) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("fill", hoverColor)
                    .style("cursor", "pointer");
            }
        })
        .on("mouseout", function (d, i) {
            if (d.properties.continent != selectedContinent) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("fill", regularColor);
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
            update()
        });
})

function update() {
    svg.selectAll(".conference-pin").remove();
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

    if (selectedContinent) {
        $('#map-hint').animate({ opacity: 0 }, 150, function () {
            $(this).addClass('invisible').css('opacity', ''); // Add 'invisible' after fade out
        });
    } else {
        $('#map-hint').removeClass('invisible').css('opacity', 0).animate({ opacity: 1 }, 150); // Fade in
    }

    const conferenceWording = (filtered.length === 1) ? "conference" : "conferences";
    const h1 = `Explore ${filtered.length} Bitcoin <br>${conferenceWording}`
    if (firstLoad) {
        $('#header-main').html(h1); // on page load
    } else {
        d3.select('#header-main')
            .transition()
            .duration(150)
            .style("opacity", 0.5) // Fade out
            .on("end", function () {
                d3.select(this)
                    .html(h1)
                    .transition()
                    .duration(150)
                    .style("opacity", 1); // Fade in
            });
    }

    const h2 = selectedContinent ? `in ${selectedContinent}` : 'Worldwide'
    if (firstLoad) {
        $('#header-secondary').html(h2); // on page load
    } else {
        d3.select('#header-secondary')
            .transition()
            .duration(150)
            .style("opacity", 0.5) // Fade out
            .on("end", function () {
                d3.select(this)
                    .html(h2)
                    .transition()
                    .duration(150)
                    .style("opacity", 1); // Fade in
            });
    }

    firstLoad = false;

    updateCards(filtered);
}

$(function () {
    // Wait until the paths are appended
    const interval = setInterval(() => {
        const pathExists = svg.selectAll("path").size() > 0;
        if (pathExists) {
            clearInterval(interval);
            update()
        }
    }, 100); // Check every 100ms
});
