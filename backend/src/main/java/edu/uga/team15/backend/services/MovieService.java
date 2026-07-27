package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.MovieStatus;
import edu.uga.team15.backend.repositories.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Business logic for movies. Sits between the controller and the repository
 * so the API layer stays thin.
 */
@Service
public class MovieService {

    private static final Logger log = LoggerFactory.getLogger(MovieService.class);

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;

    public MovieService(MovieRepository movieRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public List<Movie> getByStatus(MovieStatus status) {
        return movieRepository.findByStatus(status);
    }

    public Optional<Movie> getById(Long id) {
        return movieRepository.findById(id);
    }

    public List<Movie> searchByTitle(String title) {
        if (title == null || title.isBlank()) {
            return movieRepository.findAll();
        }
        return movieRepository.findByTitleContainingIgnoreCase(title.trim());
    }

    public List<Movie> filterByGenre(String genre) {
        if (genre == null || genre.isBlank()) {
            return movieRepository.findAll();
        }
        return movieRepository.findByGenreIgnoreCase(genre.trim());
    }

    public List<String> getGenres() {
        return movieRepository.findDistinctGenres();
    }

    /** Admin add-movie. Same fields as the seed data, validated. */
    public Movie addMovie(String title, String genre, String rating, String description,
                          String posterUrl, String trailerUrl, String status) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required.");
        }
        if (genre == null || genre.isBlank()) {
            throw new IllegalArgumentException("Genre is required.");
        }
        if (rating == null || rating.isBlank()) {
            throw new IllegalArgumentException("Pick an MPAA rating.");
        }

        MovieStatus movieStatus;
        try {
            movieStatus = MovieStatus.valueOf(status);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Pick a status: currently running or coming soon.");
        }

        Movie movie = new Movie(title.trim(), genre.trim(), rating.trim(),
                blankToNull(description), blankToNull(posterUrl), blankToNull(trailerUrl), movieStatus);

        if (movie.getPosterUrl() == null) {
            tmdbService.findMovie(movie.getTitle()).ifPresent(tmdbMovie -> {
                movie.setTmdbId(tmdbMovie.id());
                movie.setPosterPath(tmdbMovie.posterPath());
                movie.setPosterUrl(tmdbMovie.posterUrl());
            });
        }

        Movie savedMovie = movieRepository.save(movie);
        log.info("Added movie id={} title='{}' status={} tmdbEnriched={}",
                savedMovie.getId(), savedMovie.getTitle(), savedMovie.getStatus(),
                savedMovie.getTmdbId() != null);
        return savedMovie;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
