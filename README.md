# VibeChain

ML-powered music recommendation API that predicts what song you want to hear next.

Built with TypeScript, TensorFlow.js, and trained on 32K Spotify tracks.

## Quick Start

```bash
git clone https://github.com/stephenhung/vibechain.git
cd vibechain
npm run setup    # installs deps + trains model
npm run dev      # starts api on localhost:8080
```

## What it does

Give it track features (danceability, energy, mood) → get back what song to play next.

Uses a neural network trained on real Spotify data to predict musical patterns.

## API

**Health check:**
```bash
curl http://localhost:8080/health
```

**Get music prediction:**
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{"tracks":[{"danceability":0.8,"energy":0.9,"valence":0.7}]}'
```

Returns what the next song's vibe should be based on the current track.

## Scripts

```bash
npm run dev        # start dev server
npm run start      # production build + run
npm run stop       # kill all processes
npm run train      # retrain the model
npm run health     # check if api is up
```

## Config

Optional `.env` file for Spotify integration:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_secret
PORT=8080
```

## How it works

1. Trained a neural network on 32K Spotify tracks
2. Takes track features (danceability, energy, valence, tempo)  
3. Predicts what the next track's mood should be
4. Returns recommendations via REST API

Built with TypeScript + TensorFlow.js + Express.