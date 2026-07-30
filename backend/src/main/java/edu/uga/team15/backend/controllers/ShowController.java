package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.Show;
import edu.uga.team15.backend.services.ShowService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Public showtime endpoints - no login needed to browse or view seat maps. */
@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    /**
     * Upcoming showtimes for one movie: /api/shows?movieId=3
     * Leave movieId off and you get every upcoming show, which is what the
     * home page date filter needs.
     */
    @GetMapping
    public List<Show> getShows(@RequestParam(required = false) Long movieId) {
        return movieId == null ? showService.getAllUpcoming() : showService.getUpcomingForMovie(movieId);
    }

    /** Seat layout + taken seats for the booking page: /api/shows/{id}/seats */
    @GetMapping("/{id}/seats")
    public Map<String, Object> getSeats(@PathVariable Long id) {
        return showService.getSeatMap(id);
    }
}
