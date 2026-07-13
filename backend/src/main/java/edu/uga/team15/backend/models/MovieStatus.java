package edu.uga.team15.backend.models;

/**
 * Whether a movie is showing now or still upcoming.
 * Stored directly on the Movie for now; a later sprint will derive it from showings.
 */
public enum MovieStatus {
    CURRENTLY_RUNNING,
    COMING_SOON
}
