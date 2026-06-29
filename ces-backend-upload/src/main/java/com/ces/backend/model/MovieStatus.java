package com.ces.backend.model;

/**
 * Whether a movie is showing now or still upcoming.
 * Sprint 1 stores this directly on the Movie; a later sprint will derive it from showings.
 */
public enum MovieStatus {
    CURRENTLY_RUNNING,
    COMING_SOON
}
