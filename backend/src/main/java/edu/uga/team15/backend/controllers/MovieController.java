package edu.uga.team15.backend.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.services.MovieService;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/movies")

public class MovieController {
    
    @Autowired
    private MovieService movieService;
    private DataSource datasource;

    @GetMapping
    public List<Movie> getFutureMovies() {
        return movieService.getComingSoon();
    }

    @GetMapping
    public List<Movie> getPlayingMovies() {
        return movieService.getCurrentlyRunning();
    }
}
