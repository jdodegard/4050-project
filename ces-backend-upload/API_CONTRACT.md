# CES Backend — API Contract (Sprint 1)

Base URL: `http://localhost:8080`

Frontend teammates: build against these. The JSON shapes below are final for Sprint 1.

## Movie object
```json
{
  "id": 1,
  "title": "Inception",
  "genre": "Sci-Fi",
  "rating": "PG-13",
  "description": "A thief who steals corporate secrets...",
  "posterUrl": "https://image.tmdb.org/t/p/w500/....jpg",
  "trailerUrl": "https://www.youtube.com/embed/YoHD9XEInc0",
  "status": "CURRENTLY_RUNNING",
  "showtimes": ["2:00 PM", "5:00 PM", "8:00 PM"]
}
```
`status` is either `CURRENTLY_RUNNING` or `COMING_SOON`.
`trailerUrl` is a YouTube **embed** URL — drop it straight into an `<iframe src=...>`.

## Endpoints

| Purpose | Method & URL | Returns |
|---|---|---|
| Home — all movies | `GET /api/movies` | `Movie[]` |
| Home — currently running | `GET /api/movies?status=CURRENTLY_RUNNING` | `Movie[]` |
| Home — coming soon | `GET /api/movies?status=COMING_SOON` | `Movie[]` |
| Movie details | `GET /api/movies/{id}` | `Movie` (or `404` if not found) |
| Search by title | `GET /api/movies/search?title=batman` | `Movie[]` (empty `[]` = no matches) |
| Filter by genre | `GET /api/movies/filter?genre=Action` | `Movie[]` (empty `[]` = no matches) |
| Genre list (for dropdown) | `GET /api/movies/genres` | `string[]` |

Notes:
- Search and filter are **case-insensitive**. Search is a partial match.
- Empty `title`/`genre` returns all movies.
- "No matches found" message on the frontend = response array is empty `[]`.
- CORS is open (`*`) so your dev server can call the API directly.

## The two filters (per assignment)
The UI shows **genre** and **show date** filters, but only **genre** works this sprint.
Show date is a visible dropdown with no backend behind it — that's intentional and expected.
