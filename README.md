# word-webapp

Live app: https://peyo.github.io/word-webapp/
Purpose: To help users get a better understanding and feeling of words.

## features
1. Click a button, get random word.
1. Get sentiment of word.
1. Get a poem based on word.
1. Get link to a book the poem is featured in.
1. Get lyrics based on word.
1. Get a video of the song.
1. Search another random word.

## APIs used
1. dict api
* random word
* definition of word

1. poem api
* random word -> poem title & poet

1. books api
* poem title -> book

1. lyrics api
* random word -> album, track, artist
* album, track, artist -> lyrics (yes/no) -> if yes, lyrics

1. video api
* artist and track name -> video

1. sentiment api
* definition -> word sentiment
* poem -> poem sentiment
* lyrics -> lyrics sentiment
