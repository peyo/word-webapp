//this version attempted to use Google's Cloud Natural Language API
//to get a sentiment score of the searched word. Essentially,
//when someone searches for a word, the definition of the word
//would be used as the line of text to receive a sentiment score from
//the NL API. However, the NL API is only applicable via server-side,
//which I have not learned yet.

"use strict";

const dictApiKey = "9a6fa605-ec50-4c47-8446-289dd1604617";
const randoApiKey = "YDXHFI5P";
const newsApiKey = "613cb9c032f64352862a71de23221e44";
const sentiApiKey = "AIzaSyBTvtLY_gZV6NpwJJTNHScZxC1ta6vNsQM";

const dictEndPoint = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const randoEndPoint = "https://random-word-api.herokuapp.com//word";
const poemEndPoint = "http://poetrydb.org/title/";
const newsEndPoint = "https://newsapi.org/v2/everything";
const sentiAnEndPoint = "https://language.googleapis.com/v1/documents:analyzeSentiment";

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

//2.5 add parameters to Sentiment endpoint and fetch API
function searchSenti(dictData) {
    const sentiParams = {
        key: sentiApiKey,
    };

    const sentiApiKeyString = formatQueryParams(sentiParams)
    const sentiUrl = sentiAnEndPoint + "?" + sentiApiKeyString;

    const def = dictData[0].shortdef[0]
    const dict = {
        "document": {
            "language": "en-us",
            "type": "PLAIN_TEXT",
            "content": `"${def}"`
        },
        "encodingType": "UTF8"
    };

    const nlCallOptions = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(dict)
    };

    fetch(sentiUrl, nlCallOptions)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(sentiData => parseSenti(sentiData))
//    .catch(err => {
//        $("#error-message").removeClass("hidden");
//        $("#js-error-message").text(`Something went wrong with the Sentiment API: ${err.message}`);
//    });
}

//2.1 formats query parameters for all endpoints
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join("&");
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
    .catch(err => {
        $("#error-message").removeClass("hidden");
        $("#js-error-message").text(`Something went wrong with the Dictionary API: ${err.message}`);
    });
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
    .catch(err => {
        $("#error-message").removeClass("hidden");
        $("#js-error-message").text(`Something went wrong with the Poem API: ${err.message}`);
    });
}

//3.3 fetch data from Poetry API
function fetchNewsApi(newsUrl) {
    fetch(newsUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(newsData => displayNewsApi(newsData))
    //.catch(err => {
    //    $("#error-message").removeClass("hidden");
    //    $("#js-error-message").text(`Something went wrong with the News API: ${err.message}`);
    //});
}

//3.4 parse data and extract sentiment score
function parseSenti(sentiData) {
    const data = JSON.parse(sentiData);
    
    const sentiment = 0.0;
    if (data && data.documentSentiment && data.documentSentiment.score){
       sentiment = data.documentSentiment.score;
    }

    console.log(sentiment);
}

//4.1 display responseJson from Dictionary API in DOM
function displayDictApi(dictData) {
    //uppercase first letter of word searched
    const lower = dictData[0].hwi.hw;
    const upper = lower.replace(/^\w/, function (chr) {
        return chr.toUpperCase();
    });

    //replace strings in etymology
    const ety = dictData[0].et[0][1];
    const newEty = ety.replace(/{it}/g, "<i>");
    const lastEty = newEty.replace(/{\/it}/g, "</i>");

    //remove strings in date
    const dat = dictData[0].date;
    const newDat = dat.replace("{ds||1|a|1}", "");
    const lastDat = newDat.replace("{ds|t|1||}", "");

    $("#def-title2").empty();
    $("#def").empty();
    $("ety").empty();
    $("#container-result").removeClass("hidden");
    $("#def-title2").append(upper)
    $("#def").append(`
        <p>1. ${dictData[0].shortdef[0]}</p>
        <p>2. ${dictData[0].shortdef[1]}</p>
        <p>3. ${dictData[0].shortdef[2]}</p>`)
    $("#ety").append(`
        <p>${lastEty}</p>
        <p>${lastDat}</p>`)
    searchSenti(dictData);
}

//4.2 display responseJson from Poem API in DOM
function displayPoemApi(poemData) {
    let poetry = poemData[6].lines.join("<br>");

    $("#poe-title2").empty();
    $("#poet").empty();
    $("#poe").empty();
    $("#poe-title2").append(`${poemData[6].title}`)
    $("#poet").append(`By ${poemData[6].author}`)
    $("#poe").append(poetry)
}

//4.3 display responseJson from News API in DOM
function displayNewsApi(newsData) {
    $("#new-title2-3").empty();
    $("#news-img-3").empty();
    $("#auth-3").empty();
    $("#desc-3").empty();
    $("#link-3").empty();
    $("#new-title2-3").append(`${newsData.articles[3].title}`);
    $("#news-img-3").append(`<img id="news-cov" src="${newsData.articles[3].urlToImage}" alt="Cover image of news article." width=50% height=auto>`);
    $("#auth-3").append(`By ${newsData.articles[3].author}`);
    $("#desc-3").append(`${newsData.articles[3].description}`);
    $("#link-3").append(`<a href="${newsData.articles[3].url}">Full article</a>`);
    $("#new-title2-6").empty();
    $("#news-img-6").empty();
    $("#auth-6").empty();
    $("#desc-6").empty();
    $("#link-6").empty();
    $("#new-title2-6").append(`${newsData.articles[6].title}`);
    $("#news-img-6").append(`<img id="news-cov" src="${newsData.articles[6].urlToImage}" alt="Cover image of news article." width=50% height=auto>`);
    $("#auth-6").append(`By ${newsData.articles[6].author}`);
    $("#desc-6").append(`${newsData.articles[6].description}`);
    $("#link-6").append(`<a href="${newsData.articles[6].url}">Full article</a>`);
}

//1 initiates the page
function watchForm() {
    $("form").submit(event => {
        event.preventDefault();
        $("#container-index").hide();
        const word = $(".word-search").val();
        searchWord(word);
        searchPoem(word);
        searchNews(word);
    });
}

$(watchForm);