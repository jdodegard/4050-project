package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.repositories.MovieRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MovieServiceTests {

    private final MovieRepository movieRepository = mock(MovieRepository.class);
    private final TmdbService tmdbService = mock(TmdbService.class);
    private final MovieService movieService = new MovieService(movieRepository, tmdbService);

    @Test
    void resolvesAndPersistsTmdbMetadataWhenPosterIsBlank() {
        when(tmdbService.findMovie("Inception")).thenReturn(Optional.of(
                new TmdbService.TmdbMovie(
                        27205L,
                        "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                        "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg")));
        when(movieRepository.save(any(Movie.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Movie saved = movieService.addMovie(
                "Inception", "Sci-Fi", "PG-13", "", "", "", "CURRENTLY_RUNNING");

        assertEquals(27205L, saved.getTmdbId());
        assertEquals("/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", saved.getPosterPath());
        assertEquals("https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                saved.getPosterUrl());
        verify(movieRepository).save(saved);
    }

    @Test
    void preservesAnAdminProvidedPosterWithoutCallingTmdb() {
        when(movieRepository.save(any(Movie.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Movie saved = movieService.addMovie(
                "Custom Film", "Drama", "PG", null,
                "https://example.com/custom.jpg", null, "COMING_SOON");

        assertEquals("https://example.com/custom.jpg", saved.getPosterUrl());
        assertNull(saved.getTmdbId());
        verify(movieRepository).save(saved);
    }
}
