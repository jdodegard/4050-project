package edu.uga.team15.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

import java.util.Optional;

/**
 * Resolves stable TMDB metadata on the server so movie images do not depend on
 * every browser repeating a title search.
 */
@Service
public class TmdbService {

    private static final String IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(@Value("${app.tmdb-api-key:}") String apiKey) {
        this.restClient = RestClient.create("https://api.themoviedb.org/3");
        this.apiKey = apiKey;
    }

    /**
     * Returns the first TMDB movie with a poster. Lookup failures are treated
     * as a cache miss so an external outage never blocks adding a movie.
     */
    public Optional<TmdbMovie> findMovie(String title) {
        if (title == null || title.isBlank() || apiKey == null || apiKey.isBlank()
                || "paste_your_key_here".equals(apiKey)) {
            log.warn("Skipping TMDB lookup because no API key is configured.");
            return Optional.empty();
        }

        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("query", title.trim())
                            .queryParam("language", "en-US")
                            .queryParam("page", 1)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return Optional.empty();
            }

            for (JsonNode result : response.path("results")) {
                long tmdbId = result.path("id").asLong(0);
                String posterPath = result.path("poster_path").asString("");
                if (tmdbId > 0 && !posterPath.isBlank()) {
                    return Optional.of(new TmdbMovie(
                            tmdbId,
                            posterPath,
                            IMAGE_BASE_URL + posterPath));
                }
            }
        } catch (RuntimeException exception) {
            // Saving the catalog entry is more important than enriching it.
            log.warn("TMDB poster lookup failed for '{}': {}", title, exception.getMessage());
        }
        return Optional.empty();
    }

    public record TmdbMovie(long id, String posterPath, String posterUrl) {}
}
