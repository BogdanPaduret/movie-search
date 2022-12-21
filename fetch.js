// functii asincrone cu error-handling

// TMDB API
let tmdbApiKey = "3ff05c73150175415cdee107846b7677";
let tmdbRootPath = "https://api.themoviedb.org/3";
let tmdbApiKeyPath = "?api_key=" + tmdbApiKey;

let tmdbMovieSearchPath = tmdbRootPath + "/search/movie" + tmdbApiKeyPath;
let tmdbApiGenresPath =
    tmdbRootPath + "/genre/movie/list" + tmdbApiKeyPath + "&language=en-US";
let tmdbApiDetailsPath = tmdbRootPath + "/movie";
let tmdbImageBasePath = "https://image.tmdb.org/t/p";

// OMDB API
let omdbApiKey = "dbf0d08b";
let omdbBasePath = "http://www.omdbapi.com/?apikey=" + omdbApiKey + "&";
let omdbImgPath = "http://img.omdbapi.com/?apikey=" + omdbApiKey + "&";

// search results
async function fillSearchResults() {
    let searchQuery = inputSearch.value;
    searchQuery = searchQuery.replace(" ", "+");

    searchQuery = tmdbMovieSearchPath + "&query=" + searchQuery;

    // try catch cu async await in loc de fetch.then.then... .catch
    try {
        let response = await fetch(searchQuery);
        response = await response.json();
        response = await response.results;
        createAllCards(response);
    } catch (e) {
        console.error(e);
    }
}

// filters
async function getGenres() {
    try {
        let response = await fetch(tmdbApiGenresPath);
        response = await response.json();
        response = await response.genres;

        return response;
    } catch (e) {
        console.error(e);
    }
}
