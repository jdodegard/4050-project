package edu.uga.team15.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A scheduled screening: one movie, one showroom, one start time.
 * The unique constraint is the scheduling-conflict rule at the DB level;
 * ShowService checks it first so the user gets a readable error.
 */
@Entity
@Table(name = "shows", uniqueConstraints = @UniqueConstraint(columnNames = {"showroom_id", "starts_at"}))
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(optional = false)
    @JoinColumn(name = "showroom_id")
    private Showroom showroom;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    public Show() {
    }

    public Show(Movie movie, Showroom showroom, LocalDateTime startsAt) {
        this.movie = movie;
        this.showroom = showroom;
        this.startsAt = startsAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public Showroom getShowroom() { return showroom; }
    public void setShowroom(Showroom showroom) { this.showroom = showroom; }

    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
}
