"use strict";

const dictApiKey = "9a6fa605-ec50-4c47-8446-289dd1604617";
const randoApiKey = "YDXHFI5P";

const dictEndPoint = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const randoEndPoint = "http://random-word-api.herokuapp.com//word";

//2 pulls information from the Dictionary API
function searchWord(word) {
    const dictParams = {
        key: dictApiKey,
    };
    
    const dictApiKeyString = formatQueryParams(dictParams)
    const dictUrl = dictEndPoint + word + "?" + dictApiKeyString;
    
    fetch(dictUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayDictResults(responseJson))
    .catch(err => {
        $("#js-error-message").text(`Something went wrong with the Dictionary API: ${err.message}`);
    });
}

//3 formats query parameters from #2
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems;
}

//4 displays definition and etymology on result.html
function displayDictResults(responseJson) {
    window.location.assign("/result.hml")
    
    def-title
    def

    ety-title
    ety
}

//1 initiates the page
function watchForm() {
    $("form").submit(event => {
      event.preventDefault();
      const word = $("#word-search").val();
      
      searchWord(word);
    });
  }

$(watchForm);