/* ================================= */
/* KINGDOM KEYCHAINS */
/* CATEGORY SYSTEM */
/* ================================= */


/* ================================= */
/* YOUR THREE CATEGORIES */
/* ================================= */

const categories = {

    Crosses: [

        "Emmanuel",

        "Eternity Cross",

        "Healer",

        "Holy Spirit Cross",

        "Shalom",

        "Spiral Cross"

    ],


    Chainlinks: [

        "Elohim",

        "Holy Spirit Chainlinks",

        "Jesus Fish",

        "Large Chainlinks",

        "Medium Chainlinks",

        "Mini Chainlinks"

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

    albumsSection.classList.add(
        "hidden"
    );

    productsSection.classList.remove(
        "hidden"
    );


    categorySelect.value =
        category;


    categoryTitle.textContent =
        category;


    loadSubcategories(
        category
    );


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


    subcategoryFilter.innerHTML = `

        <option value="all">
            All Subcategories
        </option>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ================================= */
/* LOAD SUBCATEGORIES */
/* ================================= */

function loadSubcategories(
    category
) {

    subcategoryFilter.innerHTML = `

        <option value="all">
            All Subcategories
        </option>

    `;


    if (
        category === "all"
    ) {

        return;

    }


    if (
        !categories[category]
    ) {

        return;

    }


    categories[category].forEach(

        function(subcategory) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subcategory;


            option.textContent =
                subcategory;


            subcategoryFilter.appendChild(
                option
            );

        }

    );

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

            const subcategoryMatches =

                selectedSubcategory === "all" ||

                subcategory ===
                    selectedSubcategory;


            /* COLOR */

            const colorMatches =

                selectedColor === "all" ||

                color === selectedColor;


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

                colorMatches &&

                priceMatches &&

                searchMatches

            ) {

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