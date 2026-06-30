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