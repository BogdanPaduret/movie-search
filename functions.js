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
    // console.log(element);

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
async function fillFilters() {
    fillGenres(await getGenres());
}
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

async function getMovieImages(movieId) {
    let tmdbSearchQuery =
        tmdbApiDetailsPath + "/" + movieId + "/images" + tmdbApiKeyPath;

    try {
        let response = await fetch(tmdbSearchQuery);
        response = await response.json();
        // response = await response.backdrops;

        return response;
    } catch (e) {
        console.error(e);
    }
}

function removeCard(card) {
    console.log("To remove");
    console.log(card);
}

// maximized card
async function maximizeCard(card) {
    let movieId = card.classList[1];

    let cardColors = await getCardColorPaletteArray(movieId, 0);
    let mainColor = cardColors[0];

    setMaxiColor(mainColor, 0.5, 10);
    buildMaxiCard(movieId, mainColor);
}
function setMaxiColor(rgbColor, transparency, blurSize) {
    maxiCardSection.style.visibility = "visible";
    maxiCardSection.style.background = rgbaToString(rgbColor, transparency);
    maxiCardSection.style.backdropFilter = "blur(" + blurSize + "px)";
}
async function buildMaxiCard(movieId, colorCodeArray) {
    let tmdbDetails = await getMovieDetails(movieId);

    // generate elements
    let elements = await generateMaximizedCardElements(tmdbDetails);
    let containers = generateContainers(3, ["maxi-element"]);
    let posterZones = generateContainers(3, ["maxi-element", "click-area"]);
    let infoContainers = generateContainers(3, [
        "maxi-element",
        "info-element",
    ]);

    // edit elements
    let containerLogo = containers[0];
    let containerPosters = containers[1];
    let containerInfo = containers[2];

    let divLeft = posterZones[0];
    let divRight = posterZones[1];
    let divImg = posterZones[2];

    let titleContainer = infoContainers[0];
    let miscContainer = infoContainers[1];
    let overviewContainer = infoContainers[2];

    containerLogo.classList.add("logo");
    containerPosters.classList.add("posters");
    containerInfo.classList.add("info");

    divLeft.classList.add("left");
    divRight.classList.add("right");
    divImg.classList.add("pic");

    titleContainer.classList.add("title");
    miscContainer.classList.add("misc");
    overviewContainer.classList.add("overview");

    elements.backdrops[0].style.display = "block";

    // building card itself
    let card = elements.article;

    card.appendChild(containerLogo);
    card.appendChild(containerPosters);
    card.appendChild(containerInfo);

    // build posters container
    containerPosters.appendChild(divLeft);
    containerPosters.appendChild(divRight);
    containerPosters.appendChild(divImg);

    divImg.appendChild(elements.poster);

    // elements.backdrops.forEach((img) => {
    //     divImg.appendChild(img);
    // });

    // build info container
    containerInfo.appendChild(titleContainer);
    containerInfo.appendChild(miscContainer);
    containerInfo.appendChild(overviewContainer);

    titleContainer.appendChild(elements.title);

    miscContainer.appendChild(elements.originalTitle);
    miscContainer.appendChild(elements.releaseDate);

    overviewContainer.appendChild(elements.overview);

    // build logo container
    if (elements.mainLogo.hasAttribute("src")) {
        console.log("BINGO!");
        containerLogo.appendChild(elements.mainLogo);
    } else {
        console.log("NOT BINGO...");
        console.log(elements.title);
        containerLogo.appendChild(elements.title);
        elements.title.style.color = rgbaToString(colorCodeArray, 1);
        elements.title.style.webkitTextStroke = "1px black";
    }

    console.log(card);

    maxiCardSection.appendChild(card);
}
async function generateMaximizedCardElements(details) {
    console.log(details);

    // article
    let article = document.createElement("article");
    article.classList.add("maxi", details.id);

    // background
    let poster = document.createElement("img");
    poster.classList.add("maxi-element", "poster");
    poster.src = tmdbImageBasePath + "/original" + details.poster_path;

    // images
    let images = await getMovieImages(details.id);

    console.log(images);

    let backdrops = await images.backdrops;
    let mainLogo = await images.logos;
    if (mainLogo.length > 0) {
        mainLogo.forEach((element) => {
            if (element.iso_639_1 == "en") {
                mainLogo = element;
            }
        });
        if (mainLogo.length >= 1) {
            mainLogo = mainLogo[0];
        }
    } else {
        mainLogo = null;
    }

    // let posters = await images.posters;

    let backdropsArray = [];

    backdrops.forEach((element) => {
        let path = element.file_path;
        let el = document.createElement("img");
        el.classList.add(
            "maxi-element",
            "backdrop",
            path.substring(1, path.lastIndexOf(".jpg"))
        );
        el.src = tmdbImageBasePath + "/original" + path;

        el.style.display = "none";

        backdropsArray.push(el);
    });

    if (backdropsArray.length == 0) {
        let path = details.poster_path;
        let el = document.createElement("img");
        el.classList.add(
            "maxi-element",
            "backdrop",
            path.substring(1, path.lastIndexOf(".jpg"))
        );
        el.src = tmdbImageBasePath + "/original" + details.poster_path;
        el.style.display = "none";
        backdropsArray.push(el);
    }

    let logoElement = document.createElement("img");
    try {
        logoElement.src = tmdbImageBasePath + "/original" + mainLogo.file_path;
    } catch (e) {
        console.log(e);
    }

    // title
    let title = document.createElement("h2");
    title.classList.add("maxi-element", "title");
    title.textContent = details.title;

    // original title
    let originalTitle = document.createElement("p");
    originalTitle.classList.add("maxi-element", "original-title");
    originalTitle.textContent = "Original title: " + details.original_title;

    // release date
    let releaseDate = document.createElement("p");
    releaseDate.textContent = "Release date: " + details.release_date;

    // overview
    let overview = document.createElement("p");
    overview.classList.add("maxi-element", "overview");
    overview.textContent = details.overview;

    return {
        article,
        mainLogo: logoElement,
        poster,
        backdrops: backdropsArray, // array of the backdrops, all hidden
        title,
        releaseDate,
        originalTitle,
        overview,
    };
}
function generateContainers(amount, classesArray) {
    let containers = [];
    for (let i = 0; i < amount; i++) {
        let c = document.createElement("div");
        classesArray.forEach((classEl) => {
            c.classList.add(classEl);
        });
        containers.push(c);
    }
    return containers;
}

function closeMaximizedWindow() {
    maxiCardSection.textContent = "";
    maxiCardSection.style.visibility = "hidden";
}

// get color palletes of poster/card
let getCardColorPaletteArray = async (movieId, depth) => {
    // depth of 4 -> single color
    // depth of 0 -> 16 colors
    // why? no idea

    let movieDetails = await getMovieDetails(movieId);

    let imdbId = movieDetails.imdb_id;

    let omdbPosterPath = omdbBasePath + "i=" + imdbId;

    let omdbDetails = await fetch(omdbPosterPath);
    omdbDetails = await omdbDetails.json();

    let omdbPoster = await omdbDetails.Poster;

    let colorPaletteArray = await getColorPaletteArray(omdbPoster, depth);

    return colorPaletteArray;
};
async function getColorPaletteArray(imageURL, depth) {
    // depth de 4 returneaza o singura culoare, de 0 returneaza 16 culori
    // nu itnreba de ce... nu am inteles perfect
    let imageElement = await getImageElementFromURL(imageURL);

    let canvas = document.createElement("canvas");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);

    // cardsContainer.appendChild(canvas);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let rgbArray = buildRGBA(imageData.data);

    let quantColors = quantization(rgbArray, depth);

    let palette = buildPalette(quantColors);

    return palette;
}
function getImageElementFromURL(imageURL) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = imageURL;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject();
        };
        // img.src = imageURL;
    });
}
function buildRGBA(imageData) {
    let rgbValues = [];
    for (let i = 0; i < imageData.length; i += 4) {
        const rgba = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
            a: imageData[i + 3],
        };
        rgbValues.push(rgba);
    }
    return rgbValues;
}
function findBiggestColorRange(rgbaValues) {
    let rMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;
    let aMin = Number.MAX_VALUE;

    let rMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;
    let aMax = Number.MIN_VALUE;

    rgbaValues.forEach((pixel) => {
        rMin = Math.min(rMin, pixel.r);
        gMin = Math.min(gMin, pixel.g);
        bMin = Math.min(bMin, pixel.b);
        aMin = Math.min(aMin, pixel.a);

        rMax = Math.max(rMax, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        bMax = Math.max(bMax, pixel.b);
        aMax = Math.max(aMax, pixel.a);
    });

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;
    const aRange = aMax - aMin;

    const biggestRange = Math.max(rRange, gRange, bRange, aRange);
    if (biggestRange === rRange) {
        return "r";
    } else if (biggestRange === gRange) {
        return "g";
    } else if (biggestRange === bRange) {
        return "b";
    } else {
        return "a";
    }
}
function quantization(rgbaValues, depth) {
    const MAX_DEPTH = 4;

    // Base case
    if (depth === MAX_DEPTH || rgbaValues.length === 0) {
        const color = rgbaValues.reduce(
            (prev, curr) => {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;
                prev.a += curr.a;

                return prev;
            },
            {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
            }
        );

        color.r = Math.round(color.r / rgbaValues.length);
        color.g = Math.round(color.g / rgbaValues.length);
        color.b = Math.round(color.b / rgbaValues.length);
        color.a = Math.round(color.a / rgbaValues.length);

        return [color];
    }

    // recursion code
    const componentToSortBy = findBiggestColorRange(rgbaValues);
    rgbaValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy];
    });

    const mid = rgbaValues.length / 2;
    return [
        ...quantization(rgbaValues.slice(0, mid), depth + 1),
        ...quantization(rgbaValues.slice(mid + 1), depth + 1),
    ];
}
function orderByLuminance(colorsList) {
    const calculateLuminance = (p) => {
        return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    return colorsList.sort((p1, p2) => {
        return calculateLuminance(p2) - calculateLuminance(p1);
    });
}
function sortColors(colorList) {
    for (let c = 0; c < colorList.length; c++) {
        let r = colorList[c].r;
        let g = colorList[c].g;
        let b = colorList[c].b;

        // console.log(r + " " + g + " " + b);

        /* Getting the Max and Min values for Chroma. */
        var max = Math.max.apply(Math, [r, g, b]);
        var min = Math.min.apply(Math, [r, g, b]);

        /* Variables for HSV value of hex color. */
        var chr = max - min;
        var hue = 0;
        var val = max;
        var sat = 0;

        if (val > 0) {
            /* Calculate Saturation only if Value isn't 0. */
            sat = chr / val;
            if (sat > 0) {
                if (r == max) {
                    hue = 60 * ((g - min - (b - min)) / chr);
                    if (hue < 0) {
                        hue += 360;
                    }
                } else if (g == max) {
                    hue = 120 + 60 * ((b - min - (r - min)) / chr);
                } else if (b == max) {
                    hue = 240 + 60 * ((r - min - (g - min)) / chr);
                }
            }
        }

        /* Modifies existing objects by adding HSV values. */
        colorList[c].hue = hue;
        colorList[c].sat = sat;
        colorList[c].val = val;
    }

    // console.log(colorList);

    colorList = dropLowValueHSV(colorList, 40, 240);

    // console.log(colorList);

    /* Sort by Hue. */
    return colorList.sort(function (a, b) {
        return b.sat - a.sat;
    });
}
function dropLowValueHSV(colorList, minValue, maxValue) {
    let trimmedList = [];
    for (let i = 0; i < colorList.length; i++) {
        // console.log(colorList[i].val + " / " + minValue);
        if (
            colorList[i].val > minValue &&
            colorList[i].val < maxValue &&
            colorList[i].r < maxValue
        ) {
            trimmedList.push(colorList[i]);
        }
    }
    return trimmedList;
}
function buildPalette(colorsList) {
    return sortColors(colorsList);
}

// converters
function rgbToHex(pixel) {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return (
        "#" +
        componentToHex(pixel.r) +
        componentToHex(pixel.g) +
        componentToHex(pixel.b)
    ).toUpperCase();
}
function rgbaToString(pixel, alpha) {
    return (
        "rgba(" + pixel.r + "," + pixel.g + "," + pixel.b + "," + alpha + ")"
    );
}
function createColorDiv(color) {
    let pixel = rgbaToString(color, 1);
    console.log(pixel);

    let div = document.createElement("div");
    div.style.backgroundColor = pixel;
    div.style.height = "20px";
    div.style.width = "20px";

    return div;
}
