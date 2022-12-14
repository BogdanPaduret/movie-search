// https://www.themoviedb.org/settings/api/new?type=developer
// https://www.omdbapi.com/

let btnSearch = document.querySelector("section.search.container button");
let inputSearch = document.querySelector("section.search.container input");
let cardsContainer = document.querySelector("section.search-results.container");

let tmdbApiKey = "3ff05c73150175415cdee107846b7677";
let tmdbSearchPath =
    "https://api.themoviedb.org/3/search/movie?api_key=" + tmdbApiKey;
let tmdbImageBasePath = "https://image.tmdb.org/t/p/";

btnSearch.addEventListener("click", () => {
    getSearchResults();
});

inputSearch.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        getSearchResults();
        inputSearch.value = "";
    }
});

async function getSearchResults() {
    let searchQuery = inputSearch.value;
    searchQuery = searchQuery.replace(" ", "+");

    searchQuery = tmdbSearchPath + "&query=" + searchQuery;

    console.log(searchQuery);

    // try catch cu async await in loc de fetch.then.then... .catch
    try {
        let response = await fetch(searchQuery);
        response = await response.json();
        response = await response.results;
        createAllCards(response);
    } catch (e) {
        console.error(e);
    }

    // fetch(searchQuery)
    //     .then((data) => {
    //         return data.json();
    //     })
    //     .then((data) => {
    //         return data.results;
    //     })
    //     .then((data) => {
    //         console.log(data);
    //         createAllCards(data);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     });
}
