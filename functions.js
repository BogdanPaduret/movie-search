function createAllCards(arr) {
    arr.forEach((element) => {
        createCard(element);
    });
}

function createCard(element) {
    let card = generateCardElements(element);
    cardsContainer.appendChild(card);
}

function generateCardElements(element) {
    let poster = element.poster_path;
    if (poster == null) {
        poster = "pictures/no-image.png";
    } else {
        poster = tmdbImageBasePath + "original" + poster;
    }

    let article = document.createElement("article");
    article.style.backgroundImage = "url(" + poster + ")";
    article.classList.add("card", element.id);

    return article;
}
