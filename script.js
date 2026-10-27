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

charts.forEach(function (chart) {
    vegaEmbed(chart[0], chart[1], { actions: false })
        .then(function (result) {
            // Section 06: connect the genus panel to the heatmap and radial chart.
            if (chart[0] === "#genera_month_bump") {
                setUpGenusPanel(result.view);
            }
        })
        .catch(console.error);
});


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