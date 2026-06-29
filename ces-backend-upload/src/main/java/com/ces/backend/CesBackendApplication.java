package com.ces.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Cinema E-Booking System (CES) backend.
 * Sprint 1: serves movie data (home, details, search, filter) from the database.
 */
@SpringBootApplication
public class CesBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CesBackendApplication.class, args);
    }
}
