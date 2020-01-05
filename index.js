"use strict";

// API keys and endpoints
const wordApiKey = 'm2vinpl4rdeeur4aw73brwq1b91d53c8awznzo59nkli8ccbw';
const sentiApiKey = 'AIzaSyBTvtLY_gZV6NpwJJTNHScZxC1ta6vNsQM';
const ytApiKey = 'AIzaSyBbbEPhvZiZV8jHTJdgfviDU1ABN6W-UBw';
const bookApiKey = 'AIzaSyBiEL2F_VV6f1BRNPNkjsC0kIUvjCvWuAA';
const lyricsApiKey = '5d00f2fGlDaYcqaVdSbilkr3WSgRRNdwIkG5H3jgABG7Ko0qrDf7zOZP';

const wordEndPoint = 'https://api.wordnik.com/v4/words.json/randomWord';
const dictEndPoint = 'https://api.wordnik.com/v4/word.json/';
const poemEndPoint = 'http://poetrydb.org/lines/';
const sentiAnEndPoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment';
const bookEndPoint = 'https://www.googleapis.com/books/v1/volumes';
const lyricsIdEndPoint = 'https://api.happi.dev/v1/music';
const lyricsEndPoint = 'https://api.happi.dev/v1/music/';

// template engine for taking in title and video id for YT used in 2.5. https://github.com/FriesFlorian/tplawesome
function tplawesome(e, t) {
    let res = e;
    for (var n = 0; n < t.length; n++) {
        res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {
            return t[n][r]
        });
    };
    return res
}

// formatter used across all APIs (exluding Lyrics API)
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

// DICTIONARY DICTIONARY DICTIONARY DICTIONARY DICTIONARY DICTIONARY DICTIONARY DICTIONARY DICTIONARY
// add parameters to Dictionary endpoint
function searchWord(word) {
    const dictParams = {
        limit: 1,
        includeRelated: false,
        useCanonical: true,
        includeTags: false,
        api_key: wordApiKey,
    };

    const dictApiKeyString = formatQueryParams(dictParams)
    const dictUrl = dictEndPoint + word + '/definitions?' + dictApiKeyString;
    fetchDictApi(dictUrl);
}

// fetch Dictionary API
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
            $("#js-error-message").text(`Something went wrong. Try again in a few minutes.`);
        });
}

// display Dictionary API response in DOM
function displayDictApi(dictData) {
    //uppercase first letter of word searched and remove : and characters that appear after
    const lower = dictData[0].word;

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
    $("#def-word").append(`<b>${lower}</b> <i>(part of speech: ${dictData[0].partOfSpeech})</i>`)
    $("#def").append(`<p id="shortdef-0">${dictData[0].text}</p>`);

    //$("#ety").append(`
    //    <p>${lastEty}</p>
    //    <p>${bDat}</p>`);
    searchSentiDict(dictData);
    searchLyricsId(lower);
    searchPoem(lower);
}

// get dictionary sentiment score
function searchSentiDict(dictData) {
    let sentimood = new Sentimood();
    let senti = sentimood.analyze(`"${dictData[0].text}"`);
    let final = (Math.round(senti.score * 10) / 10).toFixed(1);
    displayDictSentScore(final);
}

// display dictionary sentiment score in DOM
function displayDictSentScore(score) {
    $("#def-sen").empty();
    $("#def-sen").append(`${score}`);
}

// POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM POEM
// add parameters to Poem endpoint
function searchPoem(word) {
    const poemUrl = poemEndPoint + word + "/title,author,lines.json";
    fetchPoemApi(poemUrl);
    poemTitle(word);
}

// fetch data from Poetry API
function fetchPoemApi(poemUrl) {
    fetch(poemUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(poemData => displayPoemApi(poemData))
        .catch(err => displayPoemApi(null));
}

// display Poem API response in DOM
function displayPoemApi(poemData) {
    if (poemData === null) {
        $("#poe-title2").empty();
        $("#poet").empty();
        $("#poe").empty();
        $("#poe-title2").append(`Sorry, no poems found.`);
        $(".book-con").addClass("book-hidden");
        $(".more").addClass("hidden");
        $(".less").addClass("hidden");
        searchSentiPoem(null);
    } else {
        //check is poem has more than one line (or more than one element in array)
        let poetry = poemData[0].lines.join("<br>");

        $("#poe-title2").empty();
        $("#poet").empty();
        $("#poe").empty();
        $("#poe-title2").append(`${poemData[0].title}<br>`);
        $("#poet").append(`By ${poemData[0].author}`);
        $("#poe").append(poetry);
        $(".book-con").removeClass("book-hidden");
        $(".more").removeClass("hidden");
        $(".less").removeClass("hidden");
        searchSentiPoem(poemData);
        searchBook(poemData[0].title);
    }
}

// display word used to search poem in header of section
function poemTitle(word) {
    $("#poem-word").empty()
    $("#poem-word").append(`<i>found by searching: ${word}</i> `);
}

// get sentiment score for poem
function searchSentiPoem(poemData) {
    if (poemData === null) {
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`"${poemData}"`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayPoemSentScore(final);
    } else {
        const poemlines = poemData[0].lines;
        const poem = poemlines.join();
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`"${poem}"`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayPoemSentScore(final);
    }
}

// display poem sentiment score in DOM
function displayPoemSentScore(score) {
    $("#poem-sen").empty();
    $("#poem-sen").append(`${score}`);
}

// BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK
// add parameters to Book endpoint
function searchBook(poemTitle) {
    const bookParams = {
        q: poemTitle,
        key: bookApiKey,
    }

    const bookApiKeyString = formatQueryParams(bookParams)
    const bookUrl = bookEndPoint + "?" + bookApiKeyString;
    fetchBookApi(bookUrl);
}

// fetch data from Book API
function fetchBookApi(bookUrl) {
    fetch(bookUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(bookData => displayBookApi(bookData))
        .catch(err => {
            $("#error-message").removeClass("hidden");
            $("#js-error-message").text(`Something went wrong. Try again in a few minutes.`);
        });
}

// display Book cover, title, author, and link to buy in DOM
function displayBookApi(bookData) {
    $("#book-cover").empty();
    if (bookData.items[0].volumeInfo.imageLinks.thumbnail === null) {
        $("#book-cover").append(`<br><br><img class="book-border" src="Sorry, no book cover found."><br><br>
        ${bookData.items[0].volumeInfo.title}<br>
        By ${bookData.items[0].volumeInfo.authors[0]}<br><br>
        <a id="buy" href="${bookData.items[0].saleInfo.buyLink}" target="_blank">Buy/View</a>`);
    } else if (bookData.items[0].volumeInfo.title === null) {
        $("#book-cover").append(`<br>Sorry, no book found.`)
    } else {
        $("#book-cover").append(`<br><br><img class="book-border" src="${bookData.items[0].volumeInfo.imageLinks.thumbnail}"><br><br>
        ${bookData.items[0].volumeInfo.title}<br>
        By ${bookData.items[0].volumeInfo.authors[0]}<br><br>
        <a id="buy" href="${bookData.items[0].saleInfo.buyLink}" target="_blank">Buy/View</a>`);
    }
}

// LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS LYRICS
// write endpoint URL + parameters for lyrics IDs
function searchLyricsId(word) {
    const lyricsParams = {
        q: word,
        limit: 50,
        apikey: lyricsApiKey
    };

    const lyricsApiKeyString = formatQueryParams(lyricsParams)
    const lyricsIdUrl = lyricsIdEndPoint + "?" + lyricsApiKeyString;
    fetchLyricsIdApi(lyricsIdUrl);
    lyricsTitle(word);
}

// fetch lyrics IDs from Lyrics API
function fetchLyricsIdApi(lyricsIdUrl) {
    fetch(lyricsIdUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(lyricsData => parseLyricsApi(lyricsData));
}

// determine if any songs were found in the response
function parseLyricsApi(lyricsData) {
    if (lyricsData.length != 0) {
        findHasLyrics(lyricsData);
    } else {
        displayLyricsApi(null);
    };
}

// if songs were found, format query to make
// another API request to get lyrics from IDs
// if no songs were found, pass null to displayLyricsAPI()
function findHasLyrics(lyricsData) {
    let data = lyricsData.result.filter(f => f.haslyrics)
    if (data.length != 0) {
        formatQueryLyrics(data);
    } else {
        displayLyricsApi(null);
    };
}

// format query for lyrics and fetch lyrics
function formatQueryLyrics(res) {
    let artistId = res[0].id_artist
    let albumId = res[0].id_album
    let trackId = res[0].id_track

    const lyricsParams = {
        artists: artistId,
        albums: albumId,
        tracks: trackId,
    };

    const lyricsApiParams = formatQueryParamsLyrics(lyricsParams)
    const lyricsUrl = lyricsEndPoint + lyricsApiParams + '/' + 'lyrics?apikey=' + lyricsApiKey;
    fetchLyricsApi(lyricsUrl);
}

// query formatter
function formatQueryParamsLyrics(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}/${encodeURIComponent(params[key])}`);
    return queryItems.join('/');
}

// fetch lyrics
function fetchLyricsApi(lyricsUrl) {
    fetch(lyricsUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(lyricsData => displayLyricsApi(lyricsData));
}

// display lyrics
// if lyrics = null then show message
// if lyrics != null then show track, artist, and lyrics
function displayLyricsApi(lyricsData) {
    if (lyricsData === null) {
        $("#lyr-title2").empty();
        $("#artist").empty();
        $("#lyr").empty();
        $("#lyr-title2").append(`Sorry, no lyrics found.`);
        $(".text").remove("#artist");
        searchSentiLyrics(null);
        searchYT(null);
    } else {
        let lyr = lyricsData.result.lyrics;
        const newLyr = lyr.replace(/\n/g, "<br>");        
        $("#lyr-title2").empty();
        $("#artist").empty();
        $("#lyr").empty();
        $("#lyr-title2").append(`${lyricsData.result.track}<br>`);
        $("#artist").append(`By ${lyricsData.result.artist}`);
        $("#lyr").append(newLyr);
        $(".lyr-con").removeClass("hidden");
        searchSentiLyrics(newLyr);
        let search = `"${lyricsData.result.track} ${lyricsData.result.artist}"`;
        searchYT(search);
    }
}

// display word used to search lyrics next to header of section
function lyricsTitle(word) {
    $("#lyrics-word").empty()
    $("#lyrics-word").append(`<i>found by searching: ${word}</i> `);
}

// get sentiment score of lyrics
function searchSentiLyrics(hasLyrics) {
    if (hasLyrics === null) {
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`"${hasLyrics}"`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayLyricsSentScore(final);
    } else {
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`"${hasLyrics}"`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayLyricsSentScore(final);
    }
}

// show sentiment score of lyrics in DOM
function displayLyricsSentScore(score) {
    $("#lyr-sen").empty();
    $("#lyr-sen").append(`${score}`);
}

// YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE
// fetch data from YouTube API
function initYT() {
    gapi.client.setApiKey(ytApiKey);
    gapi.client.load("youtube", "v3", function () {
    });
}

// add parameters to YouTube endpoint
// then display most viewed video since 2014 based on artist and lyrics
function searchYT(word) {
    if (word === null) {
        $("#yt-container").empty()
        $("#yt-container").append('Since no lyrics were found. No videos were found.')
    } else {
        const request = gapi.client.youtube.search.list({
            part: 'snippet',
            q: word,
            maxResults: 1,
            order: 'viewCount',
            publishedAfter: '2014-01-01T00:00:00Z'
        });
        request.execute(function (response) {
            let results = response.result;
            $("#yt-container").html("");
            $.each(results.items, function (index, item) {
                $.get("html/item.html", function (data) {
                    $("#video-word").empty()
                    $(".video-title").append(`<span id="video-word"> <i>found by searching ${word}</i></span>`)
                    $("#yt-container").append(tplawesome(data, [{ "title": item.snippet.title, "videoid": item.id.videoId }]));
                });
            });
        });
    }
}

// WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD
// add parameters to Word endpoint
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
        const wordUrl = wordEndPoint + '?' + wordApiKeyString;
        fetchWordApi(wordUrl);
    });
}

// fetch data from Word API
function fetchWordApi(wordUrl) {
    fetch(wordUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(wordData => randomWord(wordData))
        .catch(err => {
            $("#error-message").removeClass("hidden");
            $("#js-error-message").text(`Something went wrong. Try again in a few minutes.`);
        });
}

// push the random word into all the other functions
function randomWord(wordData) {
    let word = wordData.word
    $("#container-index").hide();
    searchWord(word);
}

$(watchButton);