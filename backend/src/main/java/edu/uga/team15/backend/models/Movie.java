package edu.uga.team15.backend.models;
public class Movie {
    private int movie_id;
    private String title;
    private String rating;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private String genre;
    private String showingStatus;

    public Movie(
        int movie_id,
        String title,
        String rating,
        String description,
        String posterUrl,
        String trailerUrl,
        String genre,
        String showingStatus
    ) {
        this.movie_id = movie_id;
        this.title = title;
        this.rating = rating;
        this.description = description;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.genre = genre;
        this.showingStatus = showingStatus;
    }//Movie()

    public int getMovie_id() {
        return movie_id;
    }

    public String getTitle() {
        return title;
    }

    public String getRating() {
        return rating;
    }

    public String getDescription() {
        return description;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public String getGenre() {
        return genre;
    }

    public String getShowingStatus() {
        return showingStatus;
    }

}//Movies.java