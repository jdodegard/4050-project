package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.MovieStatus;
import edu.uga.team15.backend.services.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for movies. These are the endpoints the frontend calls.
 */
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    /**
     * Home page. Optionally filter by status:
     *   /api/movies
     *   /api/movies?status=CURRENTLY_RUNNING
     *   /api/movies?status=COMING_SOON
     */
    @GetMapping
    public List<Movie> getMovies(@RequestParam(required = false) MovieStatus status) {
        if (status != null) {
            return movieService.getByStatus(status);
        }
        return movieService.getAllMovies();
    }

    /** Movie details page: /api/movies/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable Long id) {
        return movieService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Search by title: /api/movies/search?title=batman */
    @GetMapping("/search")
    public List<Movie> search(@RequestParam(required = false) String title) {
        return movieService.searchByTitle(title);
    }

    /** Filter by genre: /api/movies/filter?genre=Action */
    @GetMapping("/filter")
    public List<Movie> filter(@RequestParam(required = false) String genre) {
        return movieService.filterByGenre(genre);
    }

    /** Distinct genres for the filter dropdown: /api/movies/genres */
    @GetMapping("/genres")
    public List<String> genres() {
        return movieService.getGenres();
    }
}
