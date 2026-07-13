package edu.uga.team15.backend.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * A movie in the CES catalog. Maps to the "movies" table.
 * Showtimes are hardcoded/seeded for now (real scheduling comes later).
 */
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String genre;

    private String rating;       // e.g. PG, PG-13, R

    @Column(length = 2000)
    private String description;

    private String posterUrl;    // image link for the poster

    private String trailerUrl;   // embeddable trailer link (e.g. YouTube embed URL)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovieStatus status;  // CURRENTLY_RUNNING or COMING_SOON

    /** Hardcoded showtimes for this sprint, e.g. "2:00 PM", "5:00 PM", "8:00 PM". */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "movie_showtimes", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "showtime")
    private List<String> showtimes = new ArrayList<>();

    public Movie() {
    }

    public Movie(String title, String genre, String rating, String description,
                 String posterUrl, String trailerUrl, MovieStatus status, List<String> showtimes) {
        this.title = title;
        this.genre = genre;
        this.rating = rating;
        this.description = description;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.status = status;
        this.showtimes = showtimes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public MovieStatus getStatus() { return status; }
    public void setStatus(MovieStatus status) { this.status = status; }

    public List<String> getShowtimes() { return showtimes; }
    public void setShowtimes(List<String> showtimes) { this.showtimes = showtimes; }
}
