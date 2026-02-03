# iPlayMusic – Spotify Music App

A Next.js Spotify music app with login, playlists, and playback.

## Requirements (Aflevering)

- ✅ **Login** – Spotify OAuth login
- ✅ **Playlists** – Browse your Spotify playlists
- ✅ **Player** – Play music (preview or full with Spotify Premium)

## Quick Start

### 1. Install & run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

### 2. Spotify setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Add Redirect URI: `http://127.0.0.1:3000/api/auth/callback`
4. Copy Client ID and Client Secret

### 3. Environment variables

Create a `.env` file. Copy `env.example` to `.env` and add your credentials:

```bash
cp env.example .env
```

Edit `.env`:

```
NEXT_PUBLIC_CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
```

## Deployment (Vercel)

1. Push to GitHub and make the repo **public**
2. Import the project in [Vercel](https://vercel.com)
3. Add the env variables in Vercel project settings
4. Set `SPOTIFY_REDIRECT_URI` to your production callback, e.g.  
   `https://your-app.vercel.app/api/auth/callback`
5. Add the same URI in the Spotify Dashboard Redirect URIs

## Tech

- Next.js 16
- React 19
- Tailwind CSS
- Spotify Web API & Web Playback SDK
