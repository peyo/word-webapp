"use strict";

//0a API keys and endpoints
//*** API KEY HERE ***

const wordEndPoint = "https://api.wordnik.com/v4/words.json/randomWord";
const dictEndPoint = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const poemEndPoint = "http://poetrydb.org/lines/";
const newsEndPoint = "https://newsapi.org/v2/everything";
const sentiAnEndPoint = "https://language.googleapis.com/v1/documents:analyzeSentiment";
const bookEndPoint = "https://www.googleapis.com/books/v1/volumes";

//0b template engine for taking in title and video id for YT used in 2.5. https://github.com/FriesFlorian/tplawesome
function tplawesome(e,t) {
    let res = e;
    for (var n=0; n<t.length; n++) {
        res=res.replace(/\{\{(.*?)\}\}/g, function (e,r) {
            return t[n][r]
        })
    }
    return res
}

//2.1 formats query parameters for all endpoints
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join("&");
}

//2.2 add parameters to Dictionary endpoint
function searchWord(word) {
    const dictParams = {
        key: dictApiKey,
    };

    const dictApiKeyString = formatQueryParams(dictParams)
    const dictUrl = dictEndPoint + word + "?" + dictApiKeyString;
    fetchDictApi(dictUrl);
}

//2.3 add parameters to Poem endpoint
function searchPoem(word) {
    const poemUrl = poemEndPoint + word + "/title,author,lines.json";
    fetchPoemApi(poemUrl);
}

//2.4 add parameters to News endpoint
function searchNews(word) {
    const newsParams = {
        q: word,
        apiKey: newsApiKey,
    }

    const newsApiKeyString = formatQueryParams(newsParams)
    const newsUrl = newsEndPoint + "?" + newsApiKeyString;
    fetchNewsApi(newsUrl);
}

//2.5 add parameters to Book endpoint
function searchBook(poemTitle) {
    const bookParams = {
        q: poemTitle,
        key: bookApiKey,
    }
    
    const bookApiKeyString = formatQueryParams(bookParams)
    const bookUrl = bookEndPoint + "?" + bookApiKeyString;
    fetchBookApi(bookUrl);
}

//3.1 fetch responseJson from Dictionary API
function fetchDictApi(dictUrl) {
    fetch(dictUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(dictData => displayDictApi(dictData))
    //.catch(err => {
    //    $("#error-message").removeClass("hidden");
    //    $("#js-error-message").text(`Something went wrong with the Dictionary API: ${err.message}`);
    //});
}

//3.2 fetch data from Poetry API
function fetchPoemApi(poemUrl) {
    fetch(poemUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(poemData => displayPoemApi(poemData))
//        .catch(err => {
//            $("#error-message").removeClass("hidden");
//            $("#js-error-message").text(`Something went wrong with the Poem API: ${err.message}`);
//        });
}

//3.3 fetch data from News API
function fetchNewsApi(newsUrl) {
    fetch(newsUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(newsData => displayNewsApi(newsData))
    //    .catch(err => {
    //        $("#error-message").removeClass("hidden");
    //        $("#js-error-message").text(`Something went wrong with the News API: ${err.message}`);
    //    });
}

//3.4 fetch data from YouTube API
function initYT() {
    gapi.client.setApiKey(ytApiKey);
    gapi.client.load("youtube", "v3", function () {
    });
}

//3.5 fetch data from News API
function fetchBookApi(bookUrl) {
    fetch(bookUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(bookData => displayBookApi(bookData))
    //    .catch(err => {
    //        $("#error-message").removeClass("hidden");
    //        $("#js-error-message").text(`Something went wrong with the News API: ${err.message}`);
    //    });
}

//4.1 display responseJson from Dictionary API in DOM
function displayDictApi(dictData) {
    console.log("dict data", dictData)

    //uppercase first letter of word searched and remove : and characters that appear after
    const lower = dictData[0].meta.id;
    let newLower = lower;
    if (lower.indexOf(":") > -1) {
        newLower = newLower.substring(0, newLower.indexOf(":"));
    };
        const upper = newLower.replace(/^\w/, function (chr) {
        return chr.toUpperCase();
    });
    console.log("edited word", newLower);

    if (dictData[0].meta.id === undefined) {
        dictData = "-";
    }

    //replace strings in etymology
    //const ety = dictData[0].et[0][1];
    //const newEty = ety.replace(/{it}/g, "<i>");
    //const lastEty = newEty.replace(/{\/it}/g, "</i>");

    //remove strings in date
    //const dat = dictData[0].date;
    //const newDat = dat.replace("{ds||1|a|1}", "");
    //const lastDat = newDat.replace("{ds|t|1||}", "");
    //const aDat = lastDat.replace("{ds||1|a|}", "");
    //const bDat = aDat.replace("{ds||1||}", "");

    $("#def-word").empty();
    $("#def").empty();
    $("#ety").empty();
    $("#container-result").removeClass("hidden");
    $("#def-word").append(upper)
    $("#def").append(`
        <p id="shortdef-0">1. ${dictData[0].shortdef[0]}</p>
        <p id="shortdef-1">2. ${dictData[0].shortdef[1]}</p>
        <p id="shortdef-2">3. ${dictData[0].shortdef[2]}</p>`);

    //if definition is undefined hide paragraph
    if (dictData[0].shortdef[0] === undefined) {
        $("#shortdef-0").addClass("hidden");
    };
    if (dictData[0].shortdef[1] === undefined) {
        $("#shortdef-1").addClass("hidden");
    };
    if (dictData[0].shortdef[2] === undefined) {
        $("#shortdef-2").addClass("hidden");
    };
    //$("#ety").append(`
    //    <p>${lastEty}</p>
    //    <p>${bDat}</p>`);
    searchSentiDict(dictData);
    searchPoem(newLower);
    searchYT(newLower);
    searchNews(newLower);
}

//4.2 display responseJson from Poem API in DOM
function displayPoemApi(poemData) {
    console.log("poem data", poemData)

    //check is poem has more than one line (or more than one element in array)
    let poetry = poemData[0].lines.join("<br>");

    $("#poe-title2").empty();
    $("#poet").empty();
    $("#poe").empty();
    $("#poe-title2").append(`${poemData[0].title}`);
    $("#poet").append(`By ${poemData[0].author}`);
    $("#poe").append(poetry);
    searchSentiPoem(poemData);
    searchBook(poemData[0].title);

    //if poem is undefined then add hidden class
    if (poemData[0].title === undefined) {
        $("#poe-title2").addClass("hidden");
    };
    if (poemData[0].author === undefined) {
        $("#poet").addClass("hidden");
    };
    if (poetry === undefined) {
        $("#poe").addClass("hidden");
    };
    if (poemData.status === "404") {
        $("#poe-title2").addClass("hidden");
    };
    if (poemData.status === "404") {
        $("#poet").addClass("hidden");
    };
    if (poemData.status === "404") {
        $("#poe").addClass("hidden");
    };
}

//4.3 display responseJson from News API in DOM
function displayNewsApi(newsData) {
    console.log("news data", newsData)

    //if definition is undefined return - (dash)
    if (newsData.articles[3].title === undefined) {
        newsData.articles[3].title = "-";
    };
    if (newsData.articles[3].urlToImage === undefined) {
        newsData.articles[3].urlToImage = "-";
    };
    if (newsData.articles[3].author === undefined) {
        newsData.articles[3].author = "-";
    };
    if (newsData.articles[3].author === null) {
        newsData.articles[3].author = "-";
    };
    if (newsData.articles[3].description === undefined) {
        newsData.articles[3].description = "-";
    };
    if (newsData.articles[3].url === undefined) {
        newsData.articles[3].url = "-";
    };
    if (newsData.articles[6].title === undefined) {
        newsData.articles[6].title = "-";
    };
    if (newsData.articles[6].urlToImage === undefined) {
        newsData.articles[6].urlToImage = "-";
    };
    if (newsData.articles[6].author === undefined) {
        newsData.articles[6].author = "-";
    };
    if (newsData.articles[6].description === undefined) {
        newsData.articles[6].description = "-";
    };
    if (newsData.articles[6].url === undefined) {
        newsData.articles[6].url = "-";
    };
    
    $("#new-title2-3").empty();
    $("#news-img-3").empty();
    $("#auth-3").empty();
    $("#desc-3").empty();
    $("#link-3").empty();
    $("#new-title2-3").append(`${newsData.articles[3].title}`);
    $("#news-img-3").append(`<img id="news-cov" src="${newsData.articles[3].urlToImage}" alt="Cover image of news article." width=50% height=auto>`);
    $("#auth-3").append(`By ${newsData.articles[3].author}`);
    $("#desc-3").append(`${newsData.articles[3].description}`);
    $("#link-3").append(`<a href="${newsData.articles[3].url}" target="_blank">Full article</a>`);
    $("#new-title2-6").empty();
    $("#news-img-6").empty();
    $("#auth-6").empty();
    $("#desc-6").empty();
    $("#link-6").empty();
    $("#new-title2-6").append(`${newsData.articles[6].title}`);
    $("#news-img-6").append(`<img id="news-cov" src="${newsData.articles[6].urlToImage}" alt="Cover image of news article." width=50% height=auto>`);
    $("#auth-6").append(`By ${newsData.articles[6].author}`);
    $("#desc-6").append(`${newsData.articles[6].description}`);
    $("#link-6").append(`<a href="${newsData.articles[6].url}" target="_blank">Full article</a>`);
    searchSentiNews(newsData);
}

//4.4 display dictionary sentiment score in DOM
function displayDictSentScore(score) {
    $("#def-sen").empty();
    $("#def-sen").append(`${score}`);
}

//4.5 display poem sentiment score in DOM
function displayPoemSentScore(score) {
    $("#poem-sen").empty();
    $("#poem-sen").append(`${score}`);
}

//4.6a display news sentiment score in DOM
function displayNewsSentScore0(score) {
    $("#news-sen0").empty();
    $("#news-sen0").append(`${score}`);
    $("#news-sen0").empty();
    $("#news-sen0").append(`${score}`);
}

//4.6b display news sentiment score in DOM
function displayNewsSentScore1(score) {
    $("#news-sen1").empty();
    $("#news-sen1").append(`${score}`);
    $("#news-sen1").empty();
    $("#news-sen1").append(`${score}`);
}

//4.7 display most viewed video since 2014 based on searched word
function searchYT(word) {
    const request = gapi.client.youtube.search.list({
        part: "snippet",
        q: word,
        maxResults: 1,
        order: "viewCount",
        publishedAfter: "2014-01-01T00:00:00Z"
    });
    request.execute(function (response) {
        let results = response.result;
        $("#yt-container").html("");
        $.each(results.items, function (index, item) {
            $.get("html/item.html", function (data) {
                $("#yt-container").append(tplawesome(data, [{"title": item.snippet.title, "videoid": item.id.videoId}]));
            });
        });
    });
}

//4.8 display Book cover, title, author, and link to buy in DOM
function displayBookApi(bookData) {
    console.log("book data", bookData);
    if (bookData.items[0].volumeInfo.imageLinks.thumbnail === undefined) {
        bookData.items[0].volumeInfo.imageLinks.thumbnail = "-";
    };
    if (bookData.items[0].volumeInfo.title === undefined) {
        bookData.items[0].volumeInfo.title = "-";
    };
    if (bookData.items[0].volumeInfo.authors[0] === undefined) {
        bookData.items[0].volumeInfo.authors[0] = "-";
    };
    if (bookData.items[0].saleInfo.buyLink === undefined) {
        bookData.items[0].saleInfo.buyLink = "-";
    };
    
    $(".book-cover").empty();
    $(".book-cover").append(`<b>Poem found in:</b><br>
    <img class="book-border" src="${bookData.items[0].volumeInfo.imageLinks.thumbnail}"><br><br>
    ${bookData.items[0].volumeInfo.title}<br>
    By ${bookData.items[0].volumeInfo.authors[0]}<br><br>
    <a id="buy" href="${bookData.items[0].saleInfo.buyLink}" target="_blank">Buy/View</a>`);
}

//5.1 parse data and extract sentiment score for definition from sentimood.js
function searchSentiDict(dictData) {
    const def0 = dictData[0].shortdef[0];
    const def1 = dictData[0].shortdef[1];
    const def2 = dictData[0].shortdef[2];
    let sentimood0 = new Sentimood();
    let sentimood1 = new Sentimood();
    let sentimood2 = new Sentimood();
    let senti0 = sentimood0.analyze(`"${def0}"`);
    let senti1 = sentimood1.analyze(`"${def1}"`);
    let senti2 = sentimood2.analyze(`"${def2}"`);
    let senAvg = (senti0.score +
        senti1.score +
        senti2.score) / 3
    let final = (Math.round(senAvg * 10) / 10).toFixed(1);
    displayDictSentScore(final);
}

//5.2 parse data and extract sentiment score for poem from sentimood.js
function searchSentiPoem(poemData) {
    const poemlines = poemData[0].lines;
    const poem = poemlines.join();
    let sentimood = new Sentimood();
    let sentiScore = sentimood.analyze(`"${poem}"`);
    let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
    displayPoemSentScore(final);
}

//5.3 parse data and extract sentiment score for poem from sentimood.js
function searchSentiNews(newsData) {
    const art0 = newsData.articles[3].description;
    const art1 = newsData.articles[6].description;
    let sentimood0 = new Sentimood();
    let sentimood1 = new Sentimood();
    let sentiScore0 = sentimood0.analyze(`"${art0}"`);
    let sentiScore1 = sentimood1.analyze(`"${art1}"`);
    let final0 = (Math.round(sentiScore0.score * 10) / 10).toFixed(1);
    let final1 = (Math.round(sentiScore1.score * 10) / 10).toFixed(1);
    displayNewsSentScore0(final0);
    displayNewsSentScore1(final1);
}

//1a add parameters to Word endpoint
function watchButton() {
    $("form").submit(event => {
        event.preventDefault();
    
        const wordParams = {
            hasDictionaryDef: "true",
            maxCorpusCount: -1,
            minDictionaryCount: 1,
            maxDictionaryCount: -1,
            minLength: 5,
            maxLength: -1,
            api_key: wordApiKey,
        }
        
        const wordApiKeyString = formatQueryParams(wordParams)
        const wordUrl = wordEndPoint + "?" + wordApiKeyString;
        fetchWordApi(wordUrl);
    });
}

//1b fetch data from Word API
function fetchWordApi(wordUrl) {
    fetch(wordUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(wordData => randomWord(wordData))
    //    .catch(err => {
    //        $("#error-message").removeClass("hidden");
    //        $("#js-error-message").text(`Something went wrong with the News API: ${err.message}`);
    //    });
}

//1c push the random word into all the other functions
function randomWord(wordData) {
    let word = wordData.word
    console.log("word", word);
    $("#container-index").hide();
    searchWord(word);
}

$(watchButton);