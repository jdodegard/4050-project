# CES Frontend — Cinema E-Booking System

React + Vite frontend for the Cinema E-Booking System (CSCI 4050/6050, Team 15).

## Tech Stack

- React 19 + Vite 8
- React Router v7
- TMDB API (movie posters)

## Getting Started

### Prerequisites

- Node.js 18+
- The CES backend running on `http://localhost:8080`

### Setup

```bash
npm install
```

Create a `.env.local` file in this directory:

```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api).

### Run Dev Server

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Build

```bash
npm run build
```

## Sprint 1 Features

- Home page with Now Playing / Coming Soon sections (pulled from DB)
- Movie Details page with trailer, showtimes, poster
- Search by title
- Filter by genre
- Booking page prototype (seat map, ticket selection, order summary)
