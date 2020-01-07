"use strict";

// API keys and endpoints
const wordAPIKey = 'm2vinpl4rdeeur4aw73brwq1b91d53c8awznzo59nkli8ccbw';
const sentiAPIKey = 'AIzaSyBTvtLY_gZV6NpwJJTNHScZxC1ta6vNsQM';
const ytAPIKey = 'AIzaSyBbbEPhvZiZV8jHTJdgfviDU1ABN6W-UBw';
const bookAPIKey = 'AIzaSyBiEL2F_VV6f1BRNPNkjsC0kIUvjCvWuAA';
const lyricsAPIKey = '5d00f2fGlDaYcqaVdSbilkr3WSgRRNdwIkG5H3jgABG7Ko0qrDf7zOZP';

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
        let res = res.replace(/\{\{(.*?)\}\}/g, (r) => {
            return t[n][r];
        });
    };

    return res;
}

// formatter used across all APIs (exluding Lyrics API)
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

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
        api_key: wordAPIKey,
    };

    const dictAPIKeyString = formatQueryParams(dictParams)
    const dictURL = `${dictEndPoint}${word}/definitions?${dictAPIKeyString}`;
    $("#error-message").addClass("hidden");
    fetchDictAPI(dictURL);
}

// fetch Dictionary API
function fetchDictAPI(dictURL) {
    fetch(dictURL)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(response.statusText);
        })
        .then(dictData => displayDictAPI(dictData))
        .catch((err) => {
            $("#error-message").removeClass("hidden");
            $("#js-error-message").text(`Something went wrong. Refresh the page and try again in a few minutes.`);
        });
}

// display Dictionary API response in DOM
function displayDictAPI(dictData) {
    //uppercase first letter of word searched and remove : and characters that appear after
    const lower = dictData[0].word;

    $("#def-word").empty();
    $("#def").empty();
    $("#ety").empty();
    $("#container-result").removeClass("hidden");
    $("#def-word").append(`<b>${lower}</b> <i>(part of speech: ${dictData[0].partOfSpeech})</i>`)
    $("#def").append(`<p id="shortdef-0">${dictData[0].text}</p>`);
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
    const poemURL = `${poemEndPoint}${word}/title,author,lines.json`;
    fetchPoemAPI(poemURL);
    poemTitle(word);
}

// fetch data from Poetry API
function fetchPoemAPI(poemURL) {
    fetch(poemURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            
            throw new Error(response.statusText);
        })
        .then((poemData) => displayPoemAPI(poemData))
        .catch((err) => displayPoemAPI(null));
}

// display Poem API response in DOM
function displayPoemAPI(poemData) {
    if (poemData === null) {
        $('#poe-title2').empty();
        $('#poet').empty();
        $('#poe').empty();
        $('#poe-title2').append(`Sorry, no poems found.`);
        $('.book-con').addClass('book-hidden');
        $('#more-poe').addClass('hidden');
        searchSentiPoem(null);
    } else {
        //check is poem has more than one line (or more than one element in array)
        let poetry = poemData[0].lines.join('<br>');

        $('#poe-title2').empty();
        $('#poet').empty();
        $('#poe').empty();
        $('#poe-title2').append(`${poemData[0].title}<br>`);
        $('#poet').append(`By ${poemData[0].author}`);
        $('#poe').append(poetry);
        $('.book-con').removeClass('book-hidden');
        $('#more-poe').removeClass('hidden');
        searchSentiPoem(poemData);
        searchBook(poemData[0].title);
    }
}

// display word used to search poem in header of section
function poemTitle(word) {
    $('#poem-word').empty();
    $('#poem-word').append(`<i>found by searching: ${word}</i> `);
}

// get sentiment score for poem
function searchSentiPoem(poemData) {
    if (poemData === null) {
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`'${poemData}'`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayPoemSentScore(final);
    } else {
        const poemlines = poemData[0].lines;
        const poem = poemlines.join();
        let sentimood = new Sentimood();
        let sentiScore = sentimood.analyze(`'${poem}'`);
        let final = (Math.round(sentiScore.score * 10) / 10).toFixed(1);
        displayPoemSentScore(final);
    }
}

// display poem sentiment score in DOM
function displayPoemSentScore(score) {
    $('#poem-sen').empty();
    $('#poem-sen').append(`${score}`);
}

// BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK BOOK
// add parameters to Book endpoint
function searchBook(poemTitle) {
    const bookParams = {
        q: poemTitle,
        key: bookAPIKey,
    }

    const bookAPIKeyString = formatQueryParams(bookParams)
    const bookURL = bookEndPoint + '?' + bookAPIKeyString;
    fetchBookAPI(bookURL);
}

// fetch data from Book API
function fetchBookAPI(bookURL) {
    fetch(bookURL)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(response.statusText);
        })
        .then((bookData) => displayBookAPI(bookData))
        .catch((err) => {
            $('#error-message').removeClass('hidden');
            $('#js-error-message').text(`Something went wrong. Refresh the page and try again in a few minutes.`);
        });
}

// display Book cover, title, author, and link to buy in DOM
function displayBookAPI(bookData) {
    $('#book-cover').empty();
    if (bookData.items[0].volumeInfo.imageLinks.thumbnail === null) {
        $('#book-cover').append(`<br><br>Sorry, no book cover found.<br><br>
        ${bookData.items[0].volumeInfo.title}<br>
        By ${bookData.items[0].volumeInfo.authors[0]}<br><br>
        <a id="buy" href="${bookData.items[0].saleInfo.buyLink}" target="_blank">Buy/View</a>`);
    } else if (bookData.items[0].volumeInfo.title === null) {
        $('#book-cover').append(`<br>Sorry, no book found.`);
    } else {
        $('#book-cover').append(`<br><br><img class="book-border" src="${bookData.items[0].volumeInfo.imageLinks.thumbnail}"><br><br>
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
        apikey: lyricsAPIKey,
    };

    const lyricsAPIKeyString = formatQueryParams(lyricsParams);
    const lyricsIDURL = `${lyricsIdEndPoint}?${lyricsAPIKeyString}`;
    fetchLyricsIdAPI(lyricsIDURL);
    lyricsTitle(word);
}

// fetch lyrics IDs from Lyrics API
function fetchLyricsIdAPI(lyricsIDURL) {
    fetch(lyricsIDURL)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(response.statusText);
        })
        .then((lyricsData) => parseLyricsAPI(lyricsData));
}

// determine if any songs were found in the response
function parseLyricsAPI(lyricsData) {
    if (lyricsData.length !== 0) {
        findHasLyrics(lyricsData);
    } else {
        displayLyricsAPI(null);
    };
}

// if songs were found, format query to make
// another API request to get lyrics from IDs
// if no songs were found, pass null to displayLyricsAPI()
function findHasLyrics(lyricsData) {
    let data = lyricsData.result.filter((f) => f.hasLyrics)
    if (data.length !== 0) {
        formatQueryLyrics(data);
    } else {
        displayLyricsAPI(null);
    };
}

// format query for lyrics and fetch lyrics
function formatQueryLyrics(res) {
    let artistID = res[0].id_artist;
    let albumID = res[0].id_album;
    let trackID = res[0].id_track;

    const lyricsParams = {
        artists: artistID,
        albums: albumID,
        tracks: trackID,
    };

    const lyricsAPIParams = formatQueryParamsLyrics(lyricsParams)
    const lyricsURL = `${lyricsEndPoint}${lyricsAPIParams}/lyrics?apikey=${lyricsAPIKey}`;
    fetchLyricsAPI(lyricsURL);
}

// query formatter
function formatQueryParamsLyrics(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}/${encodeURIComponent(params[key])}`);

    return queryItems.join('/');
}

// fetch lyrics
function fetchLyricsAPI(lyricsURL) {
    fetch(lyricsURL)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(response.statusText);
        })
        .then((lyricsData) => displayLyricsAPI(lyricsData));
}

// display lyrics
// if lyrics = null then show message
// if lyrics !== null then show track, artist, and lyrics
function displayLyricsAPI(lyricsData) {
    if (lyricsData === null) {
        $('#lyr-title2').empty();
        $('#artist').empty();
        $('#lyr').empty();
        $('#more-lyr').addClass('hidden');
        $('.text').remove("#artist");
        $('#lyr-title2').append(`Sorry, no lyrics found.`);
        searchSentiLyrics(null);
        searchYT(null);
    } else {
        let lyr = lyricsData.result.lyrics;
        const newLyr = lyr.replace(/\n/g, '<br>');        
        $('#lyr-title2').empty();
        $('#artist').empty();
        $('#lyr').empty();
        $('.lyr-con').removeClass('hidden');
        $('#more-lyr').removeClass('hidden');
        $('#lyr-title2').append(`${lyricsData.result.track}<br>`);
        $('#artist').append(`By ${lyricsData.result.artist}`);
        $('#lyr').append(newLyr);
        searchSentiLyrics(newLyr);
        let search = `'${lyricsData.result.track} ${lyricsData.result.artist}'`;
        searchYT(search);
    }
}

// display word used to search lyrics next to header of section
function lyricsTitle(word) {
    $('#lyrics-word').empty();
    $('#lyrics-word').append(`<i>found by searching: ${word}</i> `);
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
    $('#lyr-sen').empty();
    $('#lyr-sen').append(`${score}`);
}

// YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE YOUTUBE
// fetch data from YouTube API
function initYT() {
    gapi.client.setApiKey(ytAPIKey);
    gapi.client.load('youtube', 'v3', () => {
    });
}

// add parameters to YouTube endpoint
// then display most viewed video since 2014 based on artist and lyrics
function searchYT(word) {
    if (word === null) {
        $('#yt-container').empty();
        $('#yt-container').append('Since no lyrics were found. No videos were found.');
    } else {
        const request = gapi.client.youtube.search.list({
            part: 'snippet',
            q: word,
            maxResults: 1,
            order: 'viewCount',
            publishedAfter: '2014-01-01T00:00:00Z',
        });
        request.execute((response) => {
            let results = response.result;
            $('#yt-container').html('');
            $.each(results.items, (item) => {
                $.get('html/item.html', (data) => {
                    $('#video-word').empty();
                    $('.video-title').append(`<span id="video-word"> <i>found by searching ${word}</i></span>`);
                    $('#yt-container').append(tplawesome(data, [{ 'title': item.snippet.title, 'videoid': item.id.videoId }]));
                });
            });
        });
    }
}

// WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD WORD
// add parameters to Word endpoint
function watchButton() {
    $('form').submit(event => {
        event.preventDefault();

        const wordParams = {
            hasDictionaryDef: 'true',
            maxCorpusCount: -1,
            minDictionaryCount: 1,
            maxDictionaryCount: -1,
            minLength: 5,
            maxLength: -1,
            api_key: wordAPIKey,
        }

        const wordAPIKeyString = formatQueryParams(wordParams);
        const wordURL = `${wordEndPoint}?${wordAPIKeyString}`;
        fetchWordAPI(wordURL);
    });
}

// fetch data from Word API
function fetchWordAPI(wordURL) {
    fetch(wordURL)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(response.statusText);
        })
        .then((wordData) => randomWord(wordData))
        .catch((err) => {
            $('#error-message').removeClass('hidden');
            $('#js-error-message').text(`Something went wrong. Refresh the page and try again in a few minutes.`);
        });
}

// push the random word into all the other functions
function randomWord(wordData) {
    let word = wordData.word;
    $('#container-index').hide();
    searchWord(word);
}

$(watchButton);