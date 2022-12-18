// https://www.themoviedb.org/settings/api/new?type=developer
// https://www.omdbapi.com/

let btnSearch = document.querySelector("section.search.container button");
let inputSearch = document.querySelector("section.search.container input");
let cardsContainer = document.querySelector("section.search-results.container");

let btnClearGenres = document.querySelector("button.clear-genre-filter");
let btnApplyFilters = document.querySelector("button.apply-filters");

let filtersContainer = document.querySelector("section.all-filters.container");
let genresFilterContainer = filtersContainer.querySelector(
    "section.filter.genre.tab section.filter.genre.container div"
);

fillFilters();

btnSearch.addEventListener("click", () => {
    clearSelectedGenres();
    cardsContainer.textContent = "";
    fillSearchResults();
});
btnClearGenres.addEventListener("click", () => {
    clearSelectedGenres();
});
btnApplyFilters.addEventListener("click", () => {
    applyFilters();
});

inputSearch.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        clearSelectedGenres();
        cardsContainer.textContent = "";
        fillSearchResults();
        inputSearch.value = "";
    }
});

cardsContainer.addEventListener("click", (e) => {
    let card = e.target.closest(".card");

    if (card != null) {
        mainColor(card);
    }
});
