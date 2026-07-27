package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Database access for movies. Spring Data JPA implements these automatically
 * from the method names.
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    /** Home page categories: CURRENTLY_RUNNING / COMING_SOON. */
    List<Movie> findByStatus(MovieStatus status);

    /** Search by title (case-insensitive, partial match). */
    List<Movie> findByTitleContainingIgnoreCase(String title);

    /** Filter by genre (case-insensitive, exact match). */
    List<Movie> findByGenreIgnoreCase(String genre);

    /** Distinct genres for populating the filter dropdown. */
    @Query("SELECT DISTINCT m.genre FROM Movie m ORDER BY m.genre")
    List<String> findDistinctGenres();
}
