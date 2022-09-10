# Trials of Faith
A dice mini-game with physics in three.js

playable demo on http://trials-of-faith.steinmiller.org
or http://trials-of-faith.steinmiller.org/#debug to have some debugging options

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run the following commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local dev server at http://localhost:5173 with
npm run dev

# Build for production in the dist/ directory
npm run build

# publish production build in dist/ to surge.sh (need to adjust domain in script)
# you need to provide an .env(copy from .env_template) file with PROD_URL= and optionally port= for the server
npm run deploy
```


## Powered by
- three.js
- colyseus
- express