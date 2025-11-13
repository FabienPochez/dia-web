# DIA! Radio Web

Website for DIA! Radio built with Vue 3, Tailwind CSS v4, and shadcn-vue.

## Overview

This is a web-only version of the DIA! Radio application, featuring a waiting page with:
- **LiveCard**: Displays the current live show with cover image and play controls
- **WhatsNext**: Shows upcoming shows for today and tomorrow
- **SimplePlayer**: HTML5 audio player for live stream and podcast playback

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn-vue** - High-quality Vue components built with Radix Vue and Tailwind CSS
- **HTML5 Audio** - Web-native audio playback (no Capacitor dependencies)

## Project Structure

```
src/
├── api/              # API integration with Payload CMS
├── components/       # Vue components
│   ├── live/        # LiveCard, WhatsNext
│   ├── player/      # SimplePlayer, PlayPauseButton, TrackInfo
│   └── ui/          # shadcn-vue UI components
├── composables/     # Vue composables
│   └── player/      # usePlayer with HTML5 adapter
├── lib/             # Utilities and helpers
└── main.js          # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server will start on `http://localhost:3000` (or next available port).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run serve
```

## API Configuration

The app connects to the DIA! Radio Payload CMS API:

- **Base URL**: `https://content.diaradio.live/api`
- **Live Stream**: `https://schedule.diaradio.live/main`

### Authentication

Uses JWT token-based authentication stored in localStorage. The `authClient` handles token management and automatic refresh.

## Key Features

### Audio Player
- HTML5 audio playback for live streams and podcast episodes
- Play/pause controls
- Seek functionality for podcast episodes
- MediaSession API support for browser media controls

### Live Schedule
- Real-time display of current live show
- Automatic refresh when shows change
- Upcoming shows for today and tomorrow

## Differences from Mobile App

This web version is simplified compared to the mobile app (`dia-radio-app-rss`):
- **No Capacitor**: Web-only, no native mobile features
- **HTML5 Audio Only**: No native audio adapter
- **Simplified Player**: No drawer/overlay, just basic controls
- **localStorage Only**: No Capacitor Preferences for storage

## Documentation

- **[CHANGELOG](./CHANGELOG.md)** — Development history and changes

## Related Projects

- [dia-radio-app-rss](../dia-radio-app-rss) - Mobile app with Capacitor (iOS/Android)

