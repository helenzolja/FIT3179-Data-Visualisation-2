// Draws each Vega-Lite chart into its <div> in index.html, in story order.
// Each pair is [div id in index.html, chart file in js/].
var charts = [
    ["#aus_flora_estimates_chart", "js/aus_flora_estimates_chart.json"],      // 01 Australia vs world
    ["#occurence_spike_map", "js/occurence_spike_map.json"],                  // 02 records in 2025
    ["#vegetation_waffle", "js/vegetation_waffle.json"],                      // 03 vegetation types
    ["#butterflychart_genus_species", "js/butterflychart_genus_species.json"], // 04 largest families
    ["#flora_share_map", "js/flora_share_map.json"],                          // 05 native vs naturalised
    ["#genera_month_bump", "js/genera_month_bump.json"],                      // 06 when and where (heatmap + radial)
    ["#vic_native_bin_map", "js/vic_native_bin_map.json"],                    // 07 Victoria
    ["#weed_chart", "js/weed_chart.json"],                                    // 08 weed distribution
    ["#monthly_weed_chart", "js/monthly_weed_chart.json"],                    // 09 when weeds are recorded
    ["#conservation_status", "js/conservation_status.json"]                   // 10 conservation status
];

// renderer "svg" draws the charts as vector graphics, so they stay sharp
// on every screen and at any browser zoom level (no blurriness).
charts.forEach(function (chart) {
    addViewSpecLink(chart[0], chart[1]);

    vegaEmbed(chart[0], chart[1], { actions: false, renderer: "svg" })
        .then(function (result) {
            // Section 6: connect the genus panel to the heatmap and radial chart.
            if (chart[0] === "#genera_month_bump") {
                setUpGenusPanel(result.view);
            }
            // Sections 2, 3, 7, 8, 9 and 10: draw lines from the notes to the chart.
            setUpAnnotationLines(chart[0], result.view);
        })
        .catch(console.error);
});


// ---------------------------------------------------------------------
// "VIEW SPEC" LINK
// Adds a small link at the bottom of each chart's block that opens the
// chart's Vega-Lite JSON file in a new tab.
// ---------------------------------------------------------------------
function addViewSpecLink(chartId, specFile) {
    var panel = document.querySelector(chartId).closest(".chart-panel");
    var line = document.createElement("p");
    line.className = "view-spec";
    line.innerHTML = '<a href="' + specFile + '" target="_blank" rel="noopener noreferrer"'
        + ' title="Open this chart\'s Vega-Lite JSON file in a new tab">'
        + '<span class="view-spec-icon">{ }</span>View Vega-Lite spec<span class="view-spec-arrow">↗</span></a>';
    panel.appendChild(line);
}


// ---------------------------------------------------------------------
// SECTION 06: GENUS PANEL (picture + name + fact for the chosen genus)
// Put each photo in images/genera/ with the file name given below.
// The facts are short and general; check each one against a source
// (e.g. the ANBG or a state herbarium) and cite it in your page.
// ---------------------------------------------------------------------
var genera = {
    "Acacia": {
        common: "Wattles",
        photo: "images/genera/acacia.jpeg",
        fact: "Australia's largest plant genus, with around 1,000 species. The Golden Wattle (Acacia pycnantha) is Australia's national floral emblem."
    },
    "Banksia": {
        common: "Banksias",
        photo: "images/genera/banksia.jpeg",
        fact: "Named after the botanist Joseph Banks. Almost all banksias are found only in Australia, with the most species in south-west Western Australia."
    },
    "Caladenia": {
        common: "Spider orchids",
        photo: "images/genera/caladenia.jpg",
        fact: "Ground orchids that flower mainly in spring. Many are pollinated by male wasps that the flower tricks into visiting it."
    },
    "Drosera": {
        common: "Sundews",
        photo: "images/genera/drosera.jpg",
        fact: "Carnivorous plants that catch small insects on sticky, glistening hairs. Australia has more sundew species than any other country."
    },
    "Eucalyptus": {
        common: "Gum trees",
        photo: "images/genera/eucalyptus.jpg",
        fact: "More than 700 species, almost all found only in Australia. Eucalypts dominate most of the continent's forests and woodlands."
    },
    "Grevillea": {
        common: "Spider flowers",
        photo: "images/genera/grevillea.jpg",
        fact: "Around 360 species with nectar-rich flowers that feed honeyeaters and other birds. Many are popular garden plants."
    },
    "Hibbertia": {
        common: "Guinea flowers",
        photo: "images/genera/hibbertia.jpg",
        fact: "Low shrubs and climbers with bright yellow, five-petalled flowers, said to look like old gold guinea coins."
    },
    "Lomandra": {
        common: "Mat-rushes",
        photo: "images/genera/lomandra.jpeg",
        fact: "Tough, grass-like plants found across Australia. Aboriginal people have used the long leaves for weaving baskets and mats."
    },
    "Pterostylis": {
        common: "Greenhoods",
        photo: "images/genera/pterostylis.jpeg",
        fact: "Orchids with a green hood over the flower. In many species, a touch-sensitive lip flicks a visiting insect inside, where it picks up pollen as it escapes."
    },
    "Pultenaea": {
        common: "Bush-peas",
        photo: "images/genera/Pultenaea.jpg",
        fact: "Shrubs with yellow-and-red pea flowers, often called 'egg and bacon' flowers. Most species flower in spring."
    }
};

function setUpGenusPanel(view) {
    var select = document.getElementById("genus-select");
    var startGenus = view.signal("Genus_selection");    // the genus the chart starts on

    // Fill the menu with the genera, in alphabetical order.
    Object.keys(genera).forEach(function (name) {
        var option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
    select.value = startGenus;
    showGenus(startGenus);

    // Choosing a genus updates the panel and the chart's "Genus_selection" param.
    select.addEventListener("change", function () {
        showGenus(select.value);
        view.signal("Genus_selection", select.value).runAsync();
    });
}

function showGenus(name) {
    var info = genera[name];
    var photo = document.getElementById("genus-photo");
    photo.src = info.photo;
    photo.alt = info.common + " (" + name + ")";
    document.getElementById("genus-common").textContent = info.common;
    document.getElementById("genus-fact").textContent = info.fact;
}


// ---------------------------------------------------------------------
// EMPTY PHOTO SLOTS
// If a picture file has not been added yet, show its file name in the
// pale green box instead of a broken image, so you know where to put it.
// ---------------------------------------------------------------------
function markMissingPhoto(img) {
    var slot = img.parentElement;
    var label = slot.querySelector(".photo-missing");
    if (!label) {
        label = document.createElement("span");
        label.className = "photo-missing";
        slot.appendChild(label);
    }
    label.textContent = "Add photo: " + img.getAttribute("src");
    img.style.visibility = "hidden";
}

document.querySelectorAll(".photo-slot img").forEach(function (img) {
    img.addEventListener("error", function () { markMissingPhoto(img); });
    img.addEventListener("load", function () {
        img.style.visibility = "visible";
        var label = img.parentElement.querySelector(".photo-missing");
        if (label) { label.remove(); }
    });
    if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) {
        markMissingPhoto(img);
    }
});


// ---------------------------------------------------------------------
// ANNOTATION LINES
// Each note beside a chart is joined to the part of the chart it talks
// about by a thin line ending in a small dot. The point is found from
// the chart's own data (e.g. the Blackberry bar), not typed in by hand,
// so it stays in the right place if the chart changes.
//
// For each chart: one entry per note, in the order the notes appear.
//   find(d)  -> true for the data item the note points to
//               (or a number: the item with the smallest number wins)
//   anchor   -> where on that item the line starts: "center", "right"
//               (just past a label), "edge" (right side of a square),
//               "top" (tip of a spike) or "bottom"
//   route    -> how the line reaches the note without crossing the chart:
//               "side": straight out to the right through empty space
//               "up":   up above the item first, then out to the right
//               "down": down below the item first, then out to the right
//               Every route turns towards the note only in the gap between
//               the chart and the notes.
//               "marker": no line; a small lettered marker sits on the chart
//               (moved by "offset" [x, y] so it does not hide anything) and
//               the same letter is shown on the note
//   marks    -> which kinds of chart marks to search (e.g. ["text"] for a
//               bar's value label, ["symbol"] for a dot)
//   pick     -> "rightmost": if several items match, use the one furthest right
// ---------------------------------------------------------------------
var annotations = {
    "#occurence_spike_map": [
        // Note 1 -> tip of the tallest spike (northern Sydney). The line goes
        // up above the spike's number label, then out to the right over the sea.
        { find: function (d) { return d.rank === 1; }, anchor: "top", route: "up" },
        // Note 2 -> inland Australia. Any line would cross the map, so a
        // lettered marker is placed there instead, matching the note's letter.
        { find: function (d) {
              return d.square_lon === undefined ? false
                  : Math.abs(d.square_lon - 133.5) + Math.abs(d.square_lat + 23.5);
          }, anchor: "center", route: "marker", offset: [0, -14] }
    ],
    "#vegetation_waffle": [
        // Note 1 -> right-hand edge of a row that is all woodland squares
        { find: function (d) { return d.group === "Woodlands" && d.col === 39 ? Math.abs(d.row - 6) : false; },
          anchor: "edge", marks: ["rect"], route: "side" },
        // Note 2 -> bottom of the mangrove squares; the line drops into the gap
        // under the grid and runs right, so it never crosses any squares
        { find: function (d) { return d.group === "Mangroves and coast" ? Math.abs(d.square_index - 1) : false; },
          anchor: "bottom", marks: ["rect"], route: "down" }
    ],
    "#vic_native_bin_map": [
        // Both parks are in the middle of the map, so lettered markers are used
        { find: function (d) { return d.label === "Grampians NP"; }, anchor: "center", marks: ["symbol"], route: "marker", offset: [12, -12] },
        { find: function (d) { return d.label === "Dandenong Ranges NP"; }, anchor: "center", marks: ["symbol"], route: "marker", offset: [-12, -14] }
    ],
    "#weed_chart": [
        // From the end of each bar's value label, straight out to the right
        { find: function (d) { return d.weed === "Blackberry"; }, anchor: "right", marks: ["text"], route: "side" },
        { find: function (d) { return d.weed === "Bridal Creeper"; }, anchor: "right", marks: ["text"], route: "side" }
    ],
    "#monthly_weed_chart": [
        // From the end of each peak label ("41% in February"), out to the right
        { find: function (d) { return d.vernacularName === "Blackberry"; }, anchor: "right", marks: ["text"], pick: "rightmost", route: "side" },
        { find: function (d) { return d.vernacularName === "African Boxthorn"; }, anchor: "right", marks: ["text"], pick: "rightmost", route: "side" }
    ],
    "#conservation_status": [
        // Only the first note points at the chart; the second stands alone
        { find: function (d) { return d.status === "Endangered"; }, anchor: "right", marks: ["text"], route: "side" }
    ]
};

var annotatedCharts = [];

function setUpAnnotationLines(chartId, view) {
    if (!annotations[chartId]) { return; }

    var chartDiv = document.querySelector(chartId);
    var frame = chartDiv.closest(".chart-with-aside");
    var notes = frame.querySelectorAll(".chart-aside > *");

    // A see-through SVG layer over the chart and notes, for the lines.
    var layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("class", "annotation-lines");
    frame.appendChild(layer);

    var entry = { view: view, chartDiv: chartDiv, frame: frame, notes: notes,
                  layer: layer, rules: annotations[chartId] };
    annotatedCharts.push(entry);
    drawAnnotationLines(entry);

    // Redraw whenever the chart or notes change size (window resized,
    // chart shrunk to fit, photos loaded).
    if (window.ResizeObserver) {
        new ResizeObserver(function () { drawAnnotationLines(entry); }).observe(frame);
    }
    frame.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("load", function () { drawAnnotationLines(entry); });
    });
}

// Redraw every chart's lines when the window changes size.
window.addEventListener("resize", function () {
    annotatedCharts.forEach(drawAnnotationLines);
});

function drawAnnotationLines(entry) {
    var frameBox = entry.frame.getBoundingClientRect();
    var chartBox = entry.chartDiv.getBoundingClientRect();
    var svgEl = entry.chartDiv.querySelector("svg");
    if (!svgEl) { return; }
    var svgBox = svgEl.getBoundingClientRect();
    var origin = entry.view.origin();
    // How much the chart is shrunk on screen (1 = normal size).
    var k = svgBox.width / parseFloat(svgEl.getAttribute("width") || svgBox.width);
    var html = "";

    var letters = "ABCDEFGH";
    var markerCount = 0;
    var gapX = svgBox.right - frameBox.left + 10;     // just right of the chart

    entry.rules.forEach(function (rule, i) {
        var note = entry.notes[i];
        var item = findChartItem(entry.view, rule);
        if (!note || !item) { return; }

        // Point on the chart (chart position -> position inside the frame,
        // allowing for the chart being shrunk to fit).
        var b = item.bounds;
        var px = (b.x1 + b.x2) / 2;
        var py = (b.y1 + b.y2) / 2;
        if (rule.anchor === "right") { px = b.x2 + 10; }
        if (rule.anchor === "edge") { px = b.x2 + 3; }
        if (rule.anchor === "top") { py = b.y1; }
        if (rule.anchor === "bottom") { py = b.y2 + 2; }
        var x1 = svgBox.left + k * (origin[0] + item.offsetX + px) - frameBox.left;
        var y1 = svgBox.top + k * (origin[1] + item.offsetY + py) - frameBox.top;

        if (rule.route === "marker") {
            var letter = letters[markerCount++];
            var mx = x1 + (rule.offset ? rule.offset[0] : 0);
            var my = y1 + (rule.offset ? rule.offset[1] : 0);
            html += '<circle class="marker" cx="' + mx + '" cy="' + my + '" r="9"/>';
            html += '<text class="marker-text" x="' + mx + '" y="' + (my + 4) + '">' + letter + '</text>';
            note.setAttribute("data-marker", letter);
            return;
        }

        // Point on the note: its left edge, near the top.
        var noteBox = note.getBoundingClientRect();
        var x2 = noteBox.left - frameBox.left;
        var y2 = noteBox.top - frameBox.top + Math.min(26, noteBox.height / 2);
        var turnX = Math.max(gapX, x1 + 6);

        var d = "M" + x1 + "," + y1;
        var runY = y1;
        if (rule.route === "up") { runY = y1 - 30; d += " V" + runY; }
        if (rule.route === "down") { runY = y1 + 12; d += " V" + runY; }
        d += " H" + turnX + " L" + (x2 - 8) + "," + y2 + " H" + x2;

        html += '<path class="halo" d="' + d + '"/>';
        html += '<path class="line" d="' + d + '"/>';
        html += '<circle cx="' + x1 + '" cy="' + y1 + '" r="3"/>';
    });

    entry.layer.innerHTML = html;
}

// Searches the drawn chart for the item matching a rule, and returns it
// with its position offset from the chart's top-left corner.
function findChartItem(view, rule) {
    var best = null;
    var bestScore = Infinity;

    function visit(mark, offsetX, offsetY) {
        if (!mark || !mark.items) { return; }
        mark.items.forEach(function (item) {
            if (mark.marktype === "group") {
                // Groups (e.g. each panel of a concatenated chart) shift
                // everything inside them by their own x and y.
                (item.items || []).forEach(function (child) {
                    visit(child, offsetX + (item.x || 0), offsetY + (item.y || 0));
                });
                return;
            }
            if (rule.marks && rule.marks.indexOf(mark.marktype) === -1) { return; }
            if (mark.marktype === "text" && !rule.marks) { return; }
            if (!item.datum || !item.bounds || item.bounds.empty()) { return; }

            var result = rule.find(item.datum);
            if (result === false || result === undefined || result === null) { return; }
            var score = result === true ? 0 : result;
            if (rule.pick === "rightmost") { score = -item.bounds.x2; }
            if (score < bestScore) {
                bestScore = score;
                best = { bounds: item.bounds, offsetX: offsetX, offsetY: offsetY };
            }
        });
    }

    visit(view.scenegraph().root, 0, 0);
    return best;
}