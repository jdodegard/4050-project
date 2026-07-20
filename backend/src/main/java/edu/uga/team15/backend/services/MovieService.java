package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.MovieStatus;
import edu.uga.team15.backend.repositories.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Business logic for movies. Sits between the controller and the repository
 * so the API layer stays thin.
 */
@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
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

        return movieRepository.save(new Movie(title.trim(), genre.trim(), rating.trim(),
                blankToNull(description), blankToNull(posterUrl), blankToNull(trailerUrl), movieStatus));
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
