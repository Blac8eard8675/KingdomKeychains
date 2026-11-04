/* =========================================
   KINGDOM KEYCHAINS
   COLLECTIONS, ALBUMS & PRODUCT FILTERS
========================================= */


/* =========================================
   CATEGORY STRUCTURE
========================================= */

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


/* =========================================
   NESTED ALBUM STRUCTURE
========================================= */

const nestedAlbums = {
    Bracelets: {
        "God's Knot Dead": [
            "DNA Twist",
            "God's Knot",
            "Spiral"
        ]
    },

    Chainlinks: {
        "Elohim": [
            "Hexagon Stitch",
            "Spiral Stitch"
        ],

        "Jesus Fish": [
            "Minnows",
            "Tilapia",
            "Whale"
        ]
    }
};


/* =========================================
   PAGE ELEMENTS
========================================= */

const collectionsSection = document.querySelector(".collections-section");
const albumsSection = document.getElementById("albumsSection");
const braceletAlbumsSection = document.getElementById("braceletAlbumsSection");
const chainlinkAlbumsSection = document.getElementById("chainlinkAlbumsSection");
const productsSection = document.getElementById("products");

const collectionGrid = document.getElementById("collectionGrid");
const albumGrid = document.getElementById("albumGrid");
const braceletAlbumGrid = document.getElementById("braceletAlbumGrid");
const chainlinkAlbumGrid = document.getElementById("chainlinkAlbumGrid");
const productGrid = document.getElementById("productGrid");

const productsTitle = document.getElementById("productsTitle");
const productsDescription = document.getElementById("productsDescription");

const albumsTitle = document.getElementById("albumsTitle");
const albumsDescription = document.getElementById("albumsDescription");

const braceletAlbumsTitle = document.getElementById("braceletAlbumsTitle");
const braceletAlbumsDescription = document.getElementById("braceletAlbumsDescription");

const chainlinkAlbumsTitle = document.getElementById("chainlinkAlbumsTitle");
const chainlinkAlbumsDescription = document.getElementById("chainlinkAlbumsDescription");

const noProductsMessage = document.getElementById("noProductsMessage");


/* =========================================
   FILTER ELEMENTS
========================================= */

const categorySelect = document.getElementById("categorySelect");
const subcategorySelect = document.getElementById("subcategorySelect");
const styleSelect = document.getElementById("styleSelect");
const colorSelect = document.getElementById("colorSelect");
const priceSelect = document.getElementById("priceSelect");
const searchInput = document.getElementById("searchInput");
const clearFiltersButton = document.getElementById("clearFilters");


/* =========================================
   NAVIGATION STATE
========================================= */

let currentCategory = "";
let currentSubcategory = "";
let currentStyle = "";

let previousAlbumView = null;
let currentAlbumLevel = "root";


/* =========================================
   GENERAL HELPERS
========================================= */

function sortAlphabetically(items) {
    return [...items].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
    );
}


function hideAllSections() {
    collectionsSection?.classList.add("hidden");
    albumsSection?.classList.add("hidden");
    braceletAlbumsSection?.classList.add("hidden");
    chainlinkAlbumsSection?.classList.add("hidden");
    productsSection?.classList.add("hidden");
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showCollections() {
    hideAllSections();

    collectionsSection?.classList.remove("hidden");

    scrollToTop();
}


/* =========================================
   ALPHABETIZE PRODUCT CARDS
========================================= */

function sortProductCardsAlphabetically() {
    if (!productGrid) {
        return;
    }

    const cards = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    cards.sort((a, b) => {
        const nameA = (
            a.querySelector("h3")?.textContent ||
            a.dataset.color ||
            ""
        ).trim();

        const nameB = (
            b.querySelector("h3")?.textContent ||
            b.dataset.color ||
            ""
        ).trim();

        return nameA.localeCompare(
            nameB,
            undefined,
            { sensitivity: "base" }
        );
    });

    cards.forEach(card => {
        productGrid.appendChild(card);
    });
}


/* =========================================
   CREATE ALBUM BUTTONS
========================================= */

function createAlbumCard(title, onClick) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "album-card";

    const heading = document.createElement("span");

    heading.className = "album-title";
    heading.textContent = title;

    button.appendChild(heading);
    button.addEventListener("click", onClick);

    return button;
}


/* =========================================
   OPEN A COLLECTION
========================================= */

function openCategory(category) {
    if (!categories[category]) {
        return;
    }

    currentCategory = category;
    currentSubcategory = "";
    currentStyle = "";

    previousAlbumView = null;
    currentAlbumLevel = "root";

    if (category === "Bracelets") {
        showBraceletAlbums("root");
        return;
    }

    if (category === "Chainlinks") {
        showChainlinkAlbums("root");
        return;
    }

    showStandardAlbums(category);
}


/* =========================================
   STANDARD ALBUMS
   CROSSES & ROPES
========================================= */

function showStandardAlbums(category) {
    hideAllSections();

    if (!albumsSection || !albumGrid) {
        return;
    }

    albumsSection.classList.remove("hidden");

    albumsTitle.textContent = category;
    albumsDescription.textContent =
        "Choose an album to explore.";

    albumGrid.innerHTML = "";

    sortAlphabetically(categories[category]).forEach(subcategory => {
        const card = createAlbumCard(subcategory, () => {
            previousAlbumView = {
                type: "standard",
                category: category
            };

            openProducts(category, subcategory, "");
        });

        albumGrid.appendChild(card);
    });

    scrollToTop();
}


/* =========================================
   BRACELET ALBUMS
========================================= */

function showBraceletAlbums(level, subcategory = "") {
    hideAllSections();

    if (!braceletAlbumsSection || !braceletAlbumGrid) {
        return;
    }

    braceletAlbumsSection.classList.remove("hidden");
    braceletAlbumGrid.innerHTML = "";

    currentAlbumLevel = level;

    if (level === "root") {
        braceletAlbumsTitle.textContent = "Bracelets";

        braceletAlbumsDescription.textContent =
            "Choose a bracelet collection.";

        sortAlphabetically(categories.Bracelets).forEach(name => {
            const card = createAlbumCard(name, () => {
                showBraceletAlbums("styles", name);
            });

            braceletAlbumGrid.appendChild(card);
        });
    }

    if (level === "styles") {
        currentSubcategory = subcategory;

        braceletAlbumsTitle.textContent = subcategory;

        braceletAlbumsDescription.textContent =
            "Choose a bracelet style.";

        const styles = nestedAlbums.Bracelets[subcategory] || [];

        sortAlphabetically(styles).forEach(style => {
            const card = createAlbumCard(style, () => {
                previousAlbumView = {
                    type: "bracelet",
                    level: "styles",
                    subcategory: subcategory
                };

                openProducts("Bracelets", subcategory, style);
            });

            braceletAlbumGrid.appendChild(card);
        });
    }

    scrollToTop();
}


/* =========================================
   CHAINLINK ALBUMS
========================================= */

function showChainlinkAlbums(level, subcategory = "") {
    hideAllSections();

    if (!chainlinkAlbumsSection || !chainlinkAlbumGrid) {
        return;
    }

    chainlinkAlbumsSection.classList.remove("hidden");
    chainlinkAlbumGrid.innerHTML = "";

    currentAlbumLevel = level;

    if (level === "root") {
        chainlinkAlbumsTitle.textContent = "Chainlinks";

        chainlinkAlbumsDescription.textContent =
            "Choose a Chainlink collection.";

        sortAlphabetically(categories.Chainlinks).forEach(name => {
            const card = createAlbumCard(name, () => {

                if (nestedAlbums.Chainlinks[name]) {
                    showChainlinkAlbums("styles", name);
                } else {
                    previousAlbumView = {
                        type: "chainlink",
                        level: "root"
                    };

                    openProducts("Chainlinks", name, "");
                }
            });

            chainlinkAlbumGrid.appendChild(card);
        });
    }

    if (level === "styles") {
        currentSubcategory = subcategory;

        chainlinkAlbumsTitle.textContent = subcategory;

        chainlinkAlbumsDescription.textContent =
            "Choose a Chainlink style.";

        const styles = nestedAlbums.Chainlinks[subcategory] || [];

        sortAlphabetically(styles).forEach(style => {
            const card = createAlbumCard(style, () => {
                previousAlbumView = {
                    type: "chainlink",
                    level: "styles",
                    subcategory: subcategory
                };

                openProducts("Chainlinks", subcategory, style);
            });

            chainlinkAlbumGrid.appendChild(card);
        });
    }

    scrollToTop();
}


/* =========================================
   BACK BUTTONS FOR NESTED ALBUMS
========================================= */

function goBackToBraceletAlbums() {
    if (currentAlbumLevel === "styles") {
        showBraceletAlbums("root");
    }
}


function goBackToChainlinkAlbums() {
    if (currentAlbumLevel === "styles") {
        showChainlinkAlbums("root");
    }
}


/* =========================================
   LOAD SUBCATEGORY FILTER
========================================= */

function loadSubcategories(category) {
    if (!subcategorySelect) {
        return;
    }

    subcategorySelect.innerHTML = "";

    if (!category || category === "all" || !categories[category]) {
        subcategorySelect.disabled = true;
        return;
    }

    subcategorySelect.disabled = false;

    sortAlphabetically(categories[category]).forEach(subcategory => {
        const option = document.createElement("option");

        option.value = subcategory;
        option.textContent = subcategory;

        subcategorySelect.appendChild(option);
    });

    if (subcategorySelect.options.length > 0) {
        subcategorySelect.selectedIndex = 0;
    }
}


/* =========================================
   LOAD STYLE FILTER
========================================= */

function loadStyles(category, subcategory) {
    if (!styleSelect) {
        return;
    }

    styleSelect.innerHTML = "";

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Styles";

    styleSelect.appendChild(allOption);

    const styles = new Set();

    if (category && subcategory) {
        document.querySelectorAll(".product-card").forEach(card => {
            const cardCategory = card.dataset.category || "";
            const cardSubcategory = card.dataset.subcategory || "";
            const cardStyle = card.dataset.style || "";

            if (
                cardCategory === category &&
                cardSubcategory === subcategory &&
                cardStyle
            ) {
                styles.add(cardStyle);
            }
        });
    }

    sortAlphabetically([...styles]).forEach(style => {
        const option = document.createElement("option");

        option.value = style;
        option.textContent = style;

        styleSelect.appendChild(option);
    });

    styleSelect.value = "all";
    styleSelect.disabled = styles.size === 0;
}


/* =========================================
   LOAD COLOR FILTER
========================================= */

function loadColors() {
    if (!colorSelect) {
        return;
    }

    const colors = new Set();

    document.querySelectorAll(".product-card").forEach(card => {
        const color = (card.dataset.color || "").trim();

        if (color) {
            colors.add(color);
        }
    });

    colorSelect.innerHTML = "";

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Colors";

    colorSelect.appendChild(allOption);

    sortAlphabetically([...colors]).forEach(color => {
        const option = document.createElement("option");

        option.value = color;
        option.textContent = color;

        colorSelect.appendChild(option);
    });

    colorSelect.value = "all";
}


/* =========================================
   OPEN PRODUCTS
========================================= */

function openProducts(category, subcategory = "", style = "") {
    currentCategory = category;
    currentSubcategory = subcategory;
    currentStyle = style;

    hideAllSections();

    if (!productsSection) {
        return;
    }

    productsSection.classList.remove("hidden");

    productsTitle.textContent =
        style || subcategory || category;

    productsDescription.textContent =
        "Explore this handmade collection.";

    if (categorySelect) {
        categorySelect.value = category;
    }

    loadSubcategories(category);

    if (subcategorySelect && subcategory) {
        subcategorySelect.value = subcategory;
    }

    loadStyles(category, subcategory);

    if (styleSelect) {
        styleSelect.value = style || "all";
    }

    loadColors();

    if (searchInput) {
        searchInput.value = "";
    }

    if (priceSelect) {
        priceSelect.value = "all";
    }

    if (colorSelect) {
        colorSelect.value = "all";
    }

    applyFilters();

    scrollToTop();
}


/* =========================================
   APPLY PRODUCT FILTERS
========================================= */

function applyFilters() {
    if (!productGrid) {
        return;
    }

    const selectedCategory = categorySelect?.value || "all";
    const selectedSubcategory = subcategorySelect?.value || "";
    const selectedStyle = styleSelect?.value || "all";
    const selectedColor = colorSelect?.value || "all";
    const selectedPrice = priceSelect?.value || "all";

    const searchTerm = (searchInput?.value || "")
        .trim()
        .toLowerCase();

    let visibleCount = 0;

    const productCards = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    productCards.forEach(card => {
        const category = card.dataset.category || "";
        const subcategory = card.dataset.subcategory || "";
        const style = card.dataset.style || "";
        const color = card.dataset.color || "";
        const price = card.dataset.price || "";

        const searchableText = [
            card.textContent,
            category,
            subcategory,
            style,
            color,
            price
        ].join(" ").toLowerCase();

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        const matchesSubcategory =
            !selectedSubcategory ||
            selectedSubcategory === "all" ||
            subcategory === selectedSubcategory;

        const matchesStyle =
            selectedStyle === "all" ||
            !selectedStyle ||
            style === selectedStyle;

        const matchesColor =
            selectedColor === "all" ||
            color === selectedColor;

        const matchesPrice =
            selectedPrice === "all" ||
            price === selectedPrice;

        const matchesSearch =
            !searchTerm ||
            searchableText.includes(searchTerm);

        const isVisible =
            matchesCategory &&
            matchesSubcategory &&
            matchesStyle &&
            matchesColor &&
            matchesPrice &&
            matchesSearch;

        card.classList.toggle("hidden", !isVisible);

        if (isVisible) {
            visibleCount++;
        }
    });

    if (noProductsMessage) {
        noProductsMessage.classList.toggle(
            "hidden",
            visibleCount !== 0
        );
    }
}


/* =========================================
   CLEAR FILTERS
========================================= */

function clearFilters() {
    if (categorySelect) {
        categorySelect.value = "all";
    }

    loadSubcategories("all");
    loadStyles("", "");

    if (colorSelect) {
        colorSelect.value = "all";
    }

    if (priceSelect) {
        priceSelect.value = "all";
    }

    if (searchInput) {
        searchInput.value = "";
    }

    currentCategory = "";
    currentSubcategory = "";
    currentStyle = "";

    applyFilters();
}


/* =========================================
   BACK TO PREVIOUS ALBUM
========================================= */

function goBackToPreviousAlbum() {
    if (!previousAlbumView) {
        showCollections();
        return;
    }

    if (previousAlbumView.type === "standard") {
        showStandardAlbums(previousAlbumView.category);
        return;
    }

    if (previousAlbumView.type === "bracelet") {
        showBraceletAlbums(
            previousAlbumView.level,
            previousAlbumView.subcategory
        );

        return;
    }

    if (previousAlbumView.type === "chainlink") {
        if (previousAlbumView.level === "styles") {
            showChainlinkAlbums(
                "styles",
                previousAlbumView.subcategory
            );
        } else {
            showChainlinkAlbums("root");
        }
    }
}


/* =========================================
   ALL PRODUCTS
========================================= */

function showAllProducts() {
    previousAlbumView = null;

    hideAllSections();

    if (!productsSection) {
        return;
    }

    productsSection.classList.remove("hidden");

    productsTitle.textContent = "All Products";

    productsDescription.textContent =
        "Browse the complete Kingdom Keychains collection.";

    clearFilters();

    scrollToTop();
}


/* =========================================
   COLLECTION BUTTON EVENTS
========================================= */

if (collectionGrid) {
    collectionGrid.addEventListener("click", event => {
        const card = event.target.closest(".collection-card");

        if (!card) {
            return;
        }

        openCategory(card.dataset.category);
    });
}


/* =========================================
   NAVIGATION EVENTS
========================================= */

document.getElementById("backToCollections")
    ?.addEventListener("click", showCollections);

document.getElementById("braceletBackButton")
    ?.addEventListener("click", goBackToBraceletAlbums);

document.getElementById("chainlinkBackButton")
    ?.addEventListener("click", goBackToChainlinkAlbums);

document.getElementById("backToAlbums")
    ?.addEventListener("click", goBackToPreviousAlbum);

document.getElementById("allProductsLink")
    ?.addEventListener("click", event => {
        event.preventDefault();
        showAllProducts();
    });


/* =========================================
   FILTER EVENTS
========================================= */

categorySelect?.addEventListener("change", () => {
    loadSubcategories(categorySelect.value);

    const category = categorySelect.value;
    const subcategory = subcategorySelect?.value || "";

    loadStyles(category, subcategory);

    applyFilters();
});


subcategorySelect?.addEventListener("change", () => {
    loadStyles(
        categorySelect?.value || "",
        subcategorySelect.value
    );

    applyFilters();
});


styleSelect?.addEventListener("change", applyFilters);
colorSelect?.addEventListener("change", applyFilters);
priceSelect?.addEventListener("change", applyFilters);
searchInput?.addEventListener("input", applyFilters);

clearFiltersButton?.addEventListener("click", clearFilters);


/* =========================================
   INITIALIZE PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    sortProductCardsAlphabetically();

    loadColors();
    loadSubcategories("all");
    loadStyles("", "");

    showCollections();
});

