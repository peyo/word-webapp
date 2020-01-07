# word-webapp

To help users get a better understanding and feeling of words.

<kbd><img src="https://raw.githubusercontent.com/peyo/word-webapp/master/images/home-screen.png"></kbd>

## Demo

Live app: https://peyo.github.io/word-webapp/

## Features
1. Click a button, get random word.
1. Get sentiment of word.
1. Get a poem based on word.
1. Get link to a book the poem is featured in.
1. Get lyrics based on word.
1. Get a video of the song.
1. Search another random word.

## APIs used
* Dict: [Wordnik](https://developer.wordnik.com/)
* Poem: [Poetrydb](http://poetrydb.org/index.html)
* Books: [Google](https://developers.google.com/books)
* Lyrics: [Happi](https://happi.dev/docs/music)
* Video: [YouTube](https://developers.google.com/youtube/v3)
* Sentiment: [Sentimood](https://github.com/soops/sentimood)

### API dataflow

1. Dict API used for:
* Get random word
* Get definition of word

2. Poem API used for:
* Get poem title & poet **from** random word (Dict API)

3. Books API used for:
* Get book **from** poem title (Poem API)

4. Lyrics API used for:
* Get album, track, & artist **from** random word (Dict API)
* Get lyrics **from** album, track, & artist if lyrics exist

5. Video API used for:
* Get video **from** artist & track (Lyrics API)

6. Sentiment API used for:
* Get word sentiment **from** definition (Dict API)
* Get poem sentiment **from** poem (Poem API)
* Get lyrics sentiment **from** lyrics (Lyrics API)
