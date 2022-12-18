// functii "normale" si  functii asincrone fara error-handling

// cards
function createAllCards(arr) {
    arr.forEach((element) => {
        createCard(element);
    });
}
async function createCard(element) {
    let card = await generateCard(element);
    cardsContainer.appendChild(card);
}
async function generateCard(element) {
    return buildCard(await generateCardElements(element));
}
function buildCard(cardElements) {
    // console.log(cardElements);
    let card = cardElements.article;
    card.appendChild(cardElements.container);
    let container = card.querySelector(".container");

    container.appendChild(cardElements.title);
    container.appendChild(cardElements.plot);
    container.appendChild(cardElements.genres);

    // card.appendChild(cardElements.)
    return card;
}
async function generateCardElements(element) {
    // main poster
    let posterPath = element.poster_path;
    if (posterPath == null) {
        posterPath = "/pictures/no-image.png";
    } else {
        posterPath = tmdbImageBasePath + "/w300" + posterPath;
    }

    let article = document.createElement("article");
    article.style.backgroundImage = "url(" + posterPath + ")";
    article.classList.add("card", element.id);
    article.draggable = false;

    // hover elements
    let container = document.createElement("div");
    container.classList.add("card-element", element.id, "container");

    let title = document.createElement("h3");
    title.classList.add("card-element", element.id, "title");
    title.textContent = element.title;

    let genres = document.createElement("p");
    genres.classList.add("card-element", element.id, "genres");
    let genreIDs = await getMovieGenresFromDetails(element.id);
    genreIDs.forEach((genre, key, genreIDs) => {
        genres.textContent += genre.name;
        if (!Object.is(genreIDs.length - 1, key)) {
            genres.textContent += ", ";
        }
    });

    let plot = document.createElement("p");
    plot.classList.add("card-element", element.id, "plot");
    let fullPlot = element.overview;
    let maxLength = 100;
    // let trimmedString = fullPlot.substring(0, maxLength);
    let trimmedString = (fullPlot.match(RegExp(".{" + maxLength + "}\\S*")) || [
        fullPlot,
    ])[0];
    plot.textContent = trimmedString + "...";

    // return elements
    return { article, poster: posterPath, container, title, genres, plot };
}

// filters
function fillGenres(arr) {
    arr.forEach((element) => {
        // console.log(element);
        let genre = createGenre(element);
        genresFilterContainer.appendChild(genre);
    });
}
function createGenre(el) {
    let div = document.createElement("div");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "checkbox-" + el.name;
    checkbox.value = el.id;

    let label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = el.name;

    div.appendChild(checkbox);
    div.appendChild(label);

    return div;
}

function applyFilters() {
    applyGenreFilter();
}
function applyGenreFilter() {
    let cards = cardsContainer.querySelectorAll("article");
    cards.forEach(async (card) => {
        let movieId = card.classList.item(1);
        let selectedGenres = getSelectedGenres();

        let movieGenres = await getMovieGenresFromDetails(movieId);
        let movieGenreIds = await getMovieGenreIds(movieGenres);

        let t = selectedGenres.every((r) => {
            // console.log(r);
            console.log(movieGenreIds);
            // let t2 = movieGenreIds.includes(r);
            // console.log(t2);
            return movieGenreIds.includes(r);
        });

        if (!t) {
            card.style.display = "none";
        } else {
            card.style.display = "flex";
        }
    });
}
function getSelectedGenres() {
    let arr = [];
    let genres = genresFilterContainer.getElementsByTagName("div");
    for (let i = 0; i < genres.length; i++) {
        if (genres[i].querySelector("input").checked) {
            arr.push(parseInt(genres[i].querySelector("input").value));
        }
    }
    return arr;
}
async function getMovieGenresFromDetails(movieId) {
    let genres = await getMovieDetails(movieId);
    genres = genres.genres;

    return genres;
}
function getMovieGenreIds(arr) {
    let arr2 = [];
    arr.forEach((element) => {
        arr2.push(parseInt(element.id));
    });

    return arr2;
}

function clearSelectedGenres() {
    let genres = genresFilterContainer.getElementsByTagName("div");
    for (let i = 0; i < genres.length; i++) {
        genres[i].querySelector("input").checked = false;
    }
}

// misc
async function getMovieDetails(movieId) {
    let searchQuery = tmdbApiDetailsPath + "/" + movieId + tmdbApiKeyPath;
    try {
        let response = await fetch(searchQuery);
        response = await response.json();
        return response;
    } catch (e) {
        console.error(e);
    }
}

async function getMoviePictures(movieId) {
    let tmdbSearchQuery =
        tmdbApiDetailsPath + "/" + movieId + "/images" + tmdbApiKeyPath;

    try {
        let response = await fetch(tmdbSearchQuery);
        response = await response.json();
        response = await response.backdrops;
        response.forEach((element) => {
            let img = tmdbImageBasePath + "/original" + "/" + element.file_path;
            console.log(img);
        });
    } catch (e) {
        console.error(e);
    }
}

function removeCard(card) {
    console.log("To remove");
    console.log(card);
}

// get main color of poster
let mainColor = async (card) => {
    let movieId = card.classList[1];
    let movieDetails = await getMovieDetails(movieId);

    let posterPath = movieDetails.poster_path;

    let imdbId = movieDetails.imdb_id;

    let omdbPosterPath = omdbBasePath + "i=" + imdbId;

    let omdbDetails = await fetch(omdbPosterPath);
    omdbDetails = await omdbDetails.json();

    let omdbPoster = await omdbDetails.Poster;

    // let cardDetails = await getMovieDetails(movieId);
    // const imgFile = omdbPoster;

    // const file = await createFileFromURL(imgFile);

    const fileReader = new FileReader();
    fileReader.onload = await fileReaderOnLoad(fileReader, omdbPoster);
};

async function fileReaderOnLoad(fileReader, imageURL) {
    const imageElement = await getImage(imageURL);

    const canvas = document.createElement("canvas");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);

    // cardsContainer.appendChild(canvas);
}
function getImage(imageURL) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = imageURL;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject();
        };
        // img.src = imageURL;
    });
}

// helpers
async function createFileFromURL(filePath) {
    console.log(filePath);
    try {
        let response = await fetch(filePath);
        let data = await response.blob();

        console.log(data);

        return new File([data], "poster.jpg", {
            type: "image/jpg",
        });
    } catch (e) {
        console.error(e);
    }
}

function download(file, filename) {
    // var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
