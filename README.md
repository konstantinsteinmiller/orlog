# Trials of Faith
A dice mini-game with physics in three.js
and colyseus authoratative multiplayer server

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
# you need to provide an .env(copy from .env_template) file
# with SERVER_HOST=subdomain.your-hostname.com and optionally PORT= to connect to custom server port
npm run deploy
```


## Powered by
- three.js
- colyseus
- express
- daisyUi

# Music
background music by <a href="https://pixabay.com/users/daddysmusic-22836301/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=33106">DaddysMusic</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=33106">Pixabay</a>