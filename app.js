
/* =========================================================
   KINGDOM KEYCHAINS
   HEAVENLY ROYAL LUXURY
   COLLECTIONS, ALBUMS, PRODUCTS & FILTERS
   ========================================================= */


/* =========================================================
   CATEGORY STRUCTURE
   ========================================================= */

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


/* =========================================================
   NESTED ALBUMS
   ========================================================= */

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


/* =========================================================
   PAGE ELEMENTS
   These IDs match the current index.html.
   ========================================================= */

const collectionsSection =
    document.querySelector(".collections-section");

const albumsSection =
    document.getElementById("albumsSection");

const productsSection =
    document.getElementById("products");

const collectionGrid =
    document.getElementById("collectionGrid");

const albumGrid =
    document.getElementById("albumGrid");

const productGrid =
    document.getElementById("productGrid");

const albumTitle =
    document.getElementById("albumTitle");

const albumDescription =
    document.getElementById("albumDescription");

const productsTitle =
    document.getElementById("productsTitle");

const productsDescription =
    document.getElementById("productsDescription");

const productCount =
    document.getElementById("productCount");

const noProductsMessage =
    document.getElementById("noProductsMessage");

const albumBackButton =
    document.getElementById("albumBackButton");

const productsBackButton =
    document.getElementById("productsBackButton");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   FILTER ELEMENTS
   ========================================================= */

const categoryFilter =
    document.getElementById("categoryFilter");

const subcategoryFilter =
    document.getElementById("subcategoryFilter");

const styleFilter =
    document.getElementById("styleFilter");

const colorFilter =
    document.getElementById("colorFilter");

const priceFilter =
    document.getElementById("priceFilter");

const searchInput =
    document.getElementById("searchInput");

const clearFiltersButton =
    document.getElementById("clearFilters");


/* =========================================================
   NAVIGATION STATE
   ========================================================= */

let currentCategory = "";
let currentSubcategory = "";
let currentStyle = "";

let currentAlbumLevel = "root";
let previousAlbumView = null;


/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function sortAlphabetically(items) {
    return [...items].sort((a, b) =>
        a.localeCompare(
            b,
            undefined,
            { sensitivity: "base" }
        )
    );
}


function hideAllSections() {
    collectionsSection?.classList.add("hidden");
    albumsSection?.classList.add("hidden");
    productsSection?.classList.add("hidden");
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function normalize(value) {
    return String(value || "").trim().toLowerCase();
}


/* =========================================================
   PRODUCT PRICING
   ========================================================= */

function getProductPrice(product) {
    if (product.category === "Bracelets") {
        return "5";
    }

    if (product.category === "Chainlinks") {
        return "5";
    }

    if (product.category === "Ropes") {
        return "5";
    }

    if (product.category === "Crosses") {
        const subcategory = normalize(product.subcategory);

        if (
            subcategory === "eternity cross" ||
            subcategory === "shalom"
        ) {
            return "15";
        }

        return "10";
    }

    return "";
}


/* =========================================================
   PRODUCT COUNT
   ========================================================= */

function updateProductCount(count) {
    if (!productCount) return;

    productCount.textContent =
        `${count} ${count === 1 ? "product" : "products"} found`;
}


/* =========================================================
   CREATE ALBUM CARDS
   ========================================================= */

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


/* =========================================================
   BUILD PRODUCT CARDS
   USES THE EXISTING products.js CATALOG
   ========================================================= */

function renderProducts() {
    if (!productGrid) return;

    if (
        typeof products === "undefined" ||
        !Array.isArray(products)
    ) {
        console.error(
            "Products could not be loaded. Check products.js."
        );

        updateProductCount(0);
        return;
    }

    productGrid.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("article");

        card.className = "product-card";

        card.dataset.category = product.category || "";
        card.dataset.subcategory = product.subcategory || "";
        card.dataset.style = product.style || "";
        card.dataset.color = product.color || "";
        card.dataset.price = getProductPrice(product);

        const image = document.createElement("img");

        image.className = "product-image";
        image.src = "images/" + product.image;
        image.alt =
            `${product.color || ""} ${product.category || ""}`;

        image.loading = "lazy";

        const color = document.createElement("h3");

        color.textContent = product.color || "";

        const category = document.createElement("p");

        category.textContent = product.category || "";

        const subcategory = document.createElement("p");

        subcategory.textContent = product.subcategory || "";

        card.appendChild(image);
        card.appendChild(color);
        card.appendChild(category);
        card.appendChild(subcategory);

        productGrid.appendChild(card);
    });

    sortProductCardsAlphabetically();
    updateProductCount(products.length);
}


/* =========================================================
   SORT PRODUCT CARDS BY COLOR
   ========================================================= */

function sortProductCardsAlphabetically() {
    if (!productGrid) return;

    const cards = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    cards.sort((a, b) => {
        const colorA = a.dataset.color || "";
        const colorB = b.dataset.color || "";

        return colorA.localeCompare(
            colorB,
            undefined,
            { sensitivity: "base" }
        );
    });

    cards.forEach(card => {
        productGrid.appendChild(card);
    });
}


/* =========================================================
   SHOW COLLECTIONS
   ========================================================= */

function showCollections() {
    hideAllSections();

    collectionsSection?.classList.remove("hidden");

    collectionsSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   OPEN A COLLECTION
   ========================================================= */

function openCategory(category) {
    if (!categories[category]) return;

    currentCategory = category;
    currentSubcategory = "";
    currentStyle = "";

    previousAlbumView = null;

    showAlbumView(category, "root");
}


/* =========================================================
   DISPLAY ALBUMS
   ========================================================= */

function showAlbumView(category, level, subcategory = "") {
    hideAllSections();

    if (!albumsSection || !albumGrid) return;

    albumsSection.classList.remove("hidden");

    const braceletsBanner = document.getElementById("braceletsCollectionBanner");
    const chainlinksBanner = document.getElementById("chainlinksCollectionBanner");
    const chainlinksAlbumArt = document.getElementById("chainlinksAlbumArt");
    braceletsBanner?.classList.toggle("hidden", !(category === "Bracelets" && level === "root"));
    chainlinksBanner?.classList.toggle("hidden", !(category === "Chainlinks" && level === "root"));
    chainlinksAlbumArt?.classList.toggle("hidden", category !== "Chainlinks" || level === "root");
    albumsSection?.classList.toggle("bracelets-album-page", category === "Bracelets" && level === "root");
    albumsSection?.classList.toggle("bracelets-image-only", category === "Bracelets" && level === "root");
    albumsSection?.classList.toggle("chainlinks-album-page", category === "Chainlinks" && level === "root");
    albumsSection?.classList.remove("chainlinks-entered");

    albumGrid.innerHTML = "";

    currentCategory = category;
    currentAlbumLevel = level;
    currentSubcategory = subcategory;
    currentStyle = "";

    if (level === "root") {
        albumTitle.textContent = category;

        albumDescription.textContent =
            "Choose an album to explore.";

        albumBackButton.textContent =
            "← Back to Collections";

        sortAlphabetically(categories[category]).forEach(name => {
            const card = createAlbumCard(name, () => {

                if (
                    nestedAlbums[category] &&
                    nestedAlbums[category][name]
                ) {
                    showAlbumView(category, "styles", name);
                } else {
                    openProducts(category, name, "");
                }

            });

            albumGrid.appendChild(card);
        });
    }

    if (level === "styles") {
        albumTitle.textContent = subcategory;

        albumDescription.textContent =
            "Choose a style to explore.";

        albumBackButton.textContent =
            "← Back to Albums";

        const styles =
            nestedAlbums[category]?.[subcategory] || [];

        sortAlphabetically(styles).forEach(style => {
            const card = createAlbumCard(style, () => {
                openProducts(category, subcategory, style);
            });

            albumGrid.appendChild(card);
        });
    }

    scrollToTop();
}


/* =========================================================
   ALBUM BACK BUTTON
   ========================================================= */

function goBackToAlbums() {
    if (currentAlbumLevel === "styles") {
        showAlbumView(currentCategory, "root");
    } else {
        showCollections();
    }
}


/* =========================================================
   LOAD SUBCATEGORY FILTER
   ========================================================= */

function loadSubcategories(category, selected = "all") {
    if (!subcategoryFilter) return;

    subcategoryFilter.innerHTML = "";

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Subcategories";

    subcategoryFilter.appendChild(allOption);

    if (category && category !== "all" && categories[category]) {
        sortAlphabetically(categories[category]).forEach(name => {
            const option = document.createElement("option");

            option.value = name;
            option.textContent = name;

            subcategoryFilter.appendChild(option);
        });
    }

    subcategoryFilter.disabled =
        !category || category === "all";

    subcategoryFilter.value = selected;
}


/* =========================================================
   LOAD STYLE FILTER
   ========================================================= */

function loadStyles(category, subcategory, selected = "all") {
    if (!styleFilter) return;

    styleFilter.innerHTML = "";

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Styles";

    styleFilter.appendChild(allOption);

    const styles = new Set();

    if (productGrid) {
        productGrid.querySelectorAll(".product-card").forEach(card => {
            if (
                card.dataset.category === category &&
                card.dataset.subcategory === subcategory &&
                card.dataset.style
            ) {
                styles.add(card.dataset.style);
            }
        });
    }

    sortAlphabetically([...styles]).forEach(style => {
        const option = document.createElement("option");

        option.value = style;
        option.textContent = style;

        styleFilter.appendChild(option);
    });

    styleFilter.disabled = styles.size === 0;

    styleFilter.value = selected;
}


/* =========================================================
   LOAD COLOR FILTER
   ========================================================= */

function loadColors(selected = "all") {
    if (!colorFilter || !productGrid) return;

    const colors = new Set();

    productGrid.querySelectorAll(".product-card").forEach(card => {
        const color = (card.dataset.color || "").trim();

        if (color) colors.add(color);
    });

    colorFilter.innerHTML = "";

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Colors";

    colorFilter.appendChild(allOption);

    sortAlphabetically([...colors]).forEach(color => {
        const option = document.createElement("option");

        option.value = color;
        option.textContent = color;

        colorFilter.appendChild(option);
    });

    colorFilter.value = selected;
}


/* =========================================================
   OPEN PRODUCTS
   ========================================================= */

function openProducts(category, subcategory = "", style = "") {
    previousAlbumView = {
        category: category,
        level: currentAlbumLevel,
        subcategory: currentSubcategory
    };

    currentCategory = category;
    currentSubcategory = subcategory;
    currentStyle = style;

    hideAllSections();

    if (!productsSection) return;

    productsSection.classList.remove("hidden");
    document.getElementById("chainlinksSubcategoryArt")?.classList.toggle("hidden", category !== "Chainlinks");

    productsTitle.textContent =
        style || subcategory || category;

    productsDescription.textContent =
        "Explore this handmade collection.";

    if (productsBackButton) {
        productsBackButton.classList.remove("hidden");
    }

    if (categoryFilter) {
        categoryFilter.value = category;
    }

    loadSubcategories(category, subcategory || "all");

    loadStyles(category, subcategory, style || "all");

    loadColors();

    if (searchInput) searchInput.value = "";

    if (priceFilter) priceFilter.value = "all";

    if (colorFilter) colorFilter.value = "all";

    applyFilters();

    scrollToTop();
}


/* =========================================================
   APPLY ALL PRODUCT FILTERS
   ========================================================= */

function applyFilters() {
    if (!productGrid) return;

    const selectedCategory =
        categoryFilter?.value || "all";

    const selectedSubcategory =
        subcategoryFilter?.value || "all";

    const selectedStyle =
        styleFilter?.value || "all";

    const selectedColor =
        colorFilter?.value || "all";

    const selectedPrice =
        priceFilter?.value || "all";

    const searchTerm =
        (searchInput?.value || "").trim().toLowerCase();

    let visibleCount = 0;

    const cards = productGrid.querySelectorAll(".product-card");

    cards.forEach(card => {
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
            selectedSubcategory === "all" ||
            subcategory === selectedSubcategory;

        const matchesStyle =
            selectedStyle === "all" ||
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

        const visible =
            matchesCategory &&
            matchesSubcategory &&
            matchesStyle &&
            matchesColor &&
            matchesPrice &&
            matchesSearch;

        card.classList.toggle("hidden", !visible);

        if (visible) visibleCount++;
    });

    updateProductCount(visibleCount);

    if (noProductsMessage) {
        noProductsMessage.classList.toggle(
            "hidden",
            visibleCount > 0
        );
    }
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {
    if (categoryFilter) {
        categoryFilter.value = "all";
    }

    loadSubcategories("all");
    loadStyles("", "");
    loadColors();

    if (styleFilter) styleFilter.value = "all";
    if (colorFilter) colorFilter.value = "all";
    if (priceFilter) priceFilter.value = "all";
    if (searchInput) searchInput.value = "";

    currentCategory = "";
    currentSubcategory = "";
    currentStyle = "";

    applyFilters();
}


/* =========================================================
   SHOW ALL PRODUCTS
   ========================================================= */

function showAllProducts() {
    previousAlbumView = null;

    hideAllSections();

    productsSection?.classList.remove("hidden");

    productsTitle.textContent = "All Products";

    productsDescription.textContent =
        "Browse the complete Kingdom Keychains collection.";

    if (productsBackButton) {
        productsBackButton.classList.add("hidden");
    }

    clearFilters();

    scrollToTop();
}


/* =========================================================
   RETURN TO PREVIOUS ALBUM
   ========================================================= */

function goBackToPreviousAlbum() {
    if (!previousAlbumView) {
        showCollections();
        return;
    }

    showAlbumView(
        previousAlbumView.category,
        previousAlbumView.level,
        previousAlbumView.subcategory
    );
}


/* =========================================================
   COLLECTION BUTTONS
   ========================================================= */

collectionGrid?.addEventListener("click", event => {
    const card = event.target.closest(".collection-card");

    if (!card) return;

    openCategory(card.dataset.category);
});


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

albumBackButton?.addEventListener(
    "click",
    goBackToAlbums
);

productsBackButton?.addEventListener(
    "click",
    goBackToPreviousAlbum
);

clearFiltersButton?.addEventListener(
    "click",
    clearFilters
);


/* =========================================================
   NAVIGATION LINKS
   ========================================================= */

document.querySelectorAll(".main-navigation a").forEach(link => {
    link.addEventListener("click", event => {
        const destination = link.getAttribute("href");

        if (destination === "#products") {
            event.preventDefault();
            showAllProducts();
        }

        if (destination === "#collections") {
            event.preventDefault();
            showCollections();
        }
    });
});


/* =========================================================
   FILTER EVENTS
   ========================================================= */

categoryFilter?.addEventListener("change", () => {
    loadSubcategories(categoryFilter.value);
    loadStyles(categoryFilter.value, "");
    applyFilters();
});


subcategoryFilter?.addEventListener("change", () => {
    loadStyles(
        categoryFilter?.value || "all",
        subcategoryFilter.value
    );

    applyFilters();
});


styleFilter?.addEventListener("change", applyFilters);

colorFilter?.addEventListener("change", applyFilters);

priceFilter?.addEventListener("change", applyFilters);

searchInput?.addEventListener("input", applyFilters);


/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    renderProducts();

    loadSubcategories("all");
    loadStyles("", "");
    loadColors();

    hideAllSections();

    if (document.body.dataset.page === "products") {
        showCollections();
    }

});

const braceletsWordLink = document.getElementById("braceletsWordLink");
braceletsWordLink?.addEventListener("click", () => {
    showAlbumView("Bracelets", "styles", "God's Knot Dead");
});

const chainlinksWordLink = document.getElementById("chainlinksWordLink");
chainlinksWordLink?.addEventListener("click", () => {
    albumsSection?.classList.add("chainlinks-entered");
    document.getElementById("chainlinksAlbumArt")?.classList.remove("hidden");
    albumTitle?.scrollIntoView({ behavior: "smooth", block: "start" });
});
