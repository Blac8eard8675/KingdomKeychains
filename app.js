/* ================================= */
/* KINGDOM KEYCHAINS */
/* CATEGORY SYSTEM */
/* ================================= */


/* ================================= */
/* YOUR Four CATEGORIES */
/* ================================= */

const categories = {

    Bracelets: [
        "God's Knot Dead"
    ],

    Chainlinks: [
        "Elohim",
        "Holy Spirit Chainlinks",
        "Jesus Fish",
        "Medium Chainlinks",
        "Mini Chainlinks"
    ],

    Crosses: [
        "Emmanuel",
        "Eternity Cross",
        "Healer",
        "Holy Spirit Cross",
        "Shalom",
        "Spiral Cross"
    ],

    Ropes: [
        "Brave Rope",
        "DNA Rope",
        "Eternity",
        "Holy Spirit Rope",
        "Spiral Rope"
    ]

};

/* ================================= */
/* AUTOMATIC ALBUM ALPHABETICAL SORT */
/* ================================= */

function sortAlbumGrid(grid) {

    const albums = Array.from(
        grid.querySelectorAll(".album-card")
    );

    albums.sort(function(a, b) {

        const nameA = a.querySelector("h3")
            .textContent.trim();

        const nameB = b.querySelector("h3")
            .textContent.trim();

        return nameA.localeCompare(
            nameB,
            undefined,
            { sensitivity: "base" }
        );

    });

    albums.forEach(function(album) {
        grid.appendChild(album);
    });

}


function sortAllAlbumGrids() {

    document.querySelectorAll(".album-grid")
        .forEach(function(grid) {
            sortAlbumGrid(grid);
        });

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        sortAllAlbumGrids
    );

} else {

    sortAllAlbumGrids();

}



/* ================================= */
/* GET WEBSITE ELEMENTS */
/* ================================= */

const categorySelect =
    document.getElementById(
        "categorySelect"
    );

const subcategoryFilter =
    document.getElementById(
        "subcategoryFilter"
    );

const colorFilter =
    document.getElementById(
        "colorFilter"
    );

function populateColorFilter() {
    const allColors = new Set();

    getProducts().forEach(function(card) {
        const colorText = card.dataset.color || "";

        colorText.split(",").forEach(function(color) {
            const cleanedColor = color.trim();

            if (cleanedColor) {
                allColors.add(cleanedColor);
            }
        });
    });

    colorFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Colors";
    colorFilter.appendChild(allOption);

    [...allColors]
        .sort((a, b) => a.localeCompare(b))
        .forEach(function(color) {
            const option = document.createElement("option");
            option.value = color;
            option.textContent = color;
            colorFilter.appendChild(option);
        });
}

populateColorFilter();

const priceFilter =
    document.getElementById(
        "priceFilter"
    );

const searchBox =
    document.getElementById(
        "searchBox"
    );

const albumsSection =
    document.getElementById(
        "albumsSection"
    );

const productsSection =
    document.getElementById(
        "productsSection"
    );

const categoryTitle =
    document.getElementById(
        "categoryTitle"
    );

const noResults =
    document.getElementById(
        "noResults"
    );

let activeStyle = "";


const braceletAlbumsSection =
    document.getElementById("braceletAlbumsSection");

const braceletAlbumGrid =
    document.getElementById("braceletAlbumGrid");

const chainlinksAlbumsSection =
    document.getElementById("chainlinksAlbumsSection");

const chainlinksAlbumGrid =
    document.getElementById("chainlinksAlbumGrid");


/* ================================= */
/* GET ALL PRODUCTS */
/* ================================= */

function getProducts() {

    return document.querySelectorAll(
        ".product-card"
    );

}



/* ================================= */
/* OPEN CATEGORY */
/* ================================= */


function openCategory(category) {

    if (category === "Bracelets") {

        albumsSection.classList.add("hidden");
        productsSection.classList.add("hidden");
        chainlinksAlbumsSection.classList.add("hidden");
        braceletAlbumsSection.classList.remove("hidden");

        categorySelect.value = category;
        categoryTitle.textContent = category;

        showBraceletAlbums("root");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    if (category === "Chainlinks") {

        albumsSection.classList.add("hidden");
        productsSection.classList.add("hidden");
        braceletAlbumsSection.classList.add("hidden");
        chainlinksAlbumsSection.classList.remove("hidden");

        categorySelect.value = category;
        categoryTitle.textContent = category;

        showChainlinksAlbums("root");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    activeStyle = "";
    
    braceletAlbumsSection.classList.add("hidden");
    chainlinksAlbumsSection.classList.add("hidden");
    albumsSection.classList.add("hidden");
    productsSection.classList.remove("hidden");

    categorySelect.value = category;
    categoryTitle.textContent = category;

    loadSubcategories(category);
    applyFilters();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showChainlinksAlbums(level) {

    chainlinksAlbumGrid.innerHTML = "";

    const chainlinkAlbums = [
        "Elohim",
        "Holy Spirit Chainlinks",
        "Jesus Fish",
        "Medium Chainlinks",
        "Mini Chainlinks"
    ];

    chainlinkAlbums.forEach(function(name) {

        const album = document.createElement("div");
        album.className = "album-card";

        album.innerHTML = `
            <div class="album-title">
                <h3>${name}</h3>
                <p>Explore ${name}.</p>
            </div>
        `;

        album.onclick = function() {

            if (name === "Elohim" || name === "Jesus Fish") {
                showChainlinkStyles(name);
            } else {
                openChainlinkProducts(name);
            }

        };

        chainlinksAlbumGrid.appendChild(album);

    });

    sortAlbumGrid(chainlinksAlbumGrid);
}

function showChainlinkStyles(subcategory) {

    chainlinksAlbumGrid.innerHTML = "";

    let styles = [];

    if (subcategory === "Elohim") {
        styles = [
            "Hexagon Stitch",
            "Spiral Stitch"
        ];
    }

    else if (subcategory === "Jesus Fish") {
        styles = [
            "Minnows",
            "Tilapia",
            "Whale"
        ];
    }

    styles.forEach(function(style) {

        const album = document.createElement("div");
        album.className = "album-card";

        album.innerHTML = `
            <div class="album-title">
                <h3>${style}</h3>
                <p>Explore ${style}.</p>
            </div>
        `;

        album.onclick = function() {
            openChainlinkStyleProducts(
                subcategory,
                style
            );
        };

        chainlinksAlbumGrid.appendChild(album);

    });

    sortAlbumGrid(chainlinksAlbumGrid);

}

function openChainlinkStyleProducts(subcategory, style) {

    activeStyle = style;

    braceletAlbumsSection.classList.add("hidden");
    chainlinksAlbumsSection.classList.add("hidden");
    albumsSection.classList.add("hidden");

    productsSection.classList.remove("hidden");

    categorySelect.value = "Chainlinks";
    categoryTitle.textContent = subcategory + " - " + style;

    loadSubcategories("Chainlinks");
    subcategoryFilter.value = subcategory;

    applyFilters();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
  function openChainlinkProducts(subcategory) {

    activeStyle = "";

    braceletAlbumsSection.classList.add("hidden");
    chainlinksAlbumsSection.classList.add("hidden");
    albumsSection.classList.add("hidden");

    productsSection.classList.remove("hidden");

    categorySelect.value = "Chainlinks";
    categoryTitle.textContent = subcategory;

    loadSubcategories("Chainlinks");
    subcategoryFilter.value = subcategory;

    applyFilters();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
/* ================================= */
/* RETURN TO ALBUMS */
/* ================================= */

function showAlbums() {

    productsSection.classList.add(
        "hidden"
    );

    albumsSection.classList.remove(
        "hidden"
    );


    categorySelect.value =
        "all";


  subcategoryFilter.innerHTML = "";
subcategoryFilter.disabled = true;

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ================================= */
/* LOAD SUBCATEGORIES */
/* ================================= */

function loadSubcategories(category) {

    subcategoryFilter.innerHTML = "";
    subcategoryFilter.disabled = false;

    if (!categories[category]) {
        return;
    }

    categories[category].forEach(function(subcategory) {

        const option = document.createElement("option");

        option.value = subcategory;
        option.textContent = subcategory;

        subcategoryFilter.appendChild(option);

    });

    subcategoryFilter.value = categories[category][0];

}

/* ================================= */
/* CATEGORY DROPDOWN */
/* ================================= */

categorySelect.addEventListener(

    "change",

    function() {

        const category =
            this.value;


        if (
            category === "all"
        ) {

            showAlbums();

            return;

        }


        openCategory(
            category
        );

    }

);


/* ================================= */
/* FILTER PRODUCTS */
/* ================================= */

function applyFilters() {

    const selectedCategory =
        categorySelect.value;


    const selectedSubcategory =
        subcategoryFilter.value;


    const selectedColor =
        colorFilter.value;


    const selectedPrice =
        priceFilter.value;


    const searchText =
        searchBox.value
            .toLowerCase()
            .trim();


    let visibleProducts = 0;


    getProducts().forEach(

        function(card) {


            const category =
                card.dataset.category;


            const subcategory =
                card.dataset.subcategory;


            const color =
                card.dataset.color;


            const price =
                parseFloat(
                    card.dataset.price
                );


            /* CATEGORY */

            const categoryMatches =

                selectedCategory === "all" ||

                category === selectedCategory;


        /* SUBCATEGORY */

const normalize = value =>
    (value || "").trim().toLowerCase();

const subcategoryMatches =
    !selectedSubcategory ||
    normalize(subcategory) ===
        normalize(selectedSubcategory);

const styleMatches =
    !activeStyle ||
    normalize(card.dataset.style) ===
        normalize(activeStyle);

            /* COLOR */

            
const productColors = (color || "")
    .split(/[,;]+/)
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

const selectedColors = (selectedColor || "")
    .split(/[,;]+/)
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

const colorMatches =
    selectedColor === "all" ||
    selectedColors.some(c => productColors.includes(c));


            /* PRICE */

            let priceMatches = true;


            if (
                selectedPrice === "under5"
            ) {

                priceMatches =
                    price < 5;

            }


            else if (
                selectedPrice === "5to10"
            ) {

                priceMatches =
                    price >= 5 &&
                    price <= 10;

            }


            else if (
                selectedPrice === "10to15"
            ) {

                priceMatches =
                    price > 10 &&
                    price <= 15;

            }


            else if (
                selectedPrice === "15plus"
            ) {

                priceMatches =
                    price > 15;

            }


            /* SEARCH */

            const productText =
                card.textContent
                    .toLowerCase();


            const searchMatches =

                searchText === "" ||

                productText.includes(
                    searchText
                );


            /* SHOW PRODUCT */

      if (
    categoryMatches &&
    subcategoryMatches &&
    styleMatches &&
    colorMatches &&
    priceMatches &&
    searchMatches
)   {

                card.style.display =
                    "";

                visibleProducts++;

            }


            else {

                card.style.display =
                    "none";

            }

        }

    );


    /* ================================= */
    /* NO RESULTS */
    /* ================================= */

    if (
        visibleProducts === 0
    ) {

        noResults.classList.remove(
            "hidden"
        );

    }

    else {

        noResults.classList.add(
            "hidden"
        );

    }

}


/* ================================= */
/* FILTER EVENTS */
/* ================================= */

subcategoryFilter.addEventListener(

    "change",

    applyFilters

);


colorFilter.addEventListener(

    "change",

    applyFilters

);


priceFilter.addEventListener(

    "change",

    applyFilters

);


searchBox.addEventListener(

    "input",

    applyFilters

);
