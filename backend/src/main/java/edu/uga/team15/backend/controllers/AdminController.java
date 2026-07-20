package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.*;
import edu.uga.team15.backend.repositories.UserRepository;
import edu.uga.team15.backend.services.MovieService;
import edu.uga.team15.backend.services.PromotionService;
import edu.uga.team15.backend.services.ShowService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * The admin portal endpoints. Every route checks the session for an ADMIN
 * role first - customers and signed-out visitors get a 403/401.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final MovieService movieService;
    private final ShowService showService;
    private final PromotionService promotionService;
    private final UserRepository userRepository;

    public AdminController(MovieService movieService, ShowService showService,
                           PromotionService promotionService, UserRepository userRepository) {
        this.movieService = movieService;
        this.showService = showService;
        this.promotionService = promotionService;
        this.userRepository = userRepository;
    }

    record NewMovie(String title, String genre, String rating, String description,
                    String posterUrl, String trailerUrl, String status) {}

    @PostMapping("/movies")
    public Movie addMovie(@RequestBody NewMovie req, HttpSession session) {
        requireAdmin(session);
        return movieService.addMovie(req.title(), req.genre(), req.rating(),
                req.description(), req.posterUrl(), req.trailerUrl(), req.status());
    }

    @GetMapping("/showrooms")
    public List<Showroom> getShowrooms(HttpSession session) {
        requireAdmin(session);
        return showService.getShowrooms();
    }

    /** The full schedule, for the manage-showtimes page. */
    @GetMapping("/shows")
    public List<Show> getShows(HttpSession session) {
        requireAdmin(session);
        return showService.getAll();
    }

    record NewShow(Long movieId, Long showroomId, String date, String time) {}

    @PostMapping("/shows")
    public Show addShow(@RequestBody NewShow req, HttpSession session) {
        requireAdmin(session);
        return showService.schedule(req.movieId(), req.showroomId(), req.date(), req.time());
    }

    @GetMapping("/promotions")
    public List<Promotion> getPromotions(HttpSession session) {
        requireAdmin(session);
        return promotionService.getAll();
    }

    record NewPromotion(String code, String description, Integer discountPercent,
                        String startDate, String endDate) {}

    @PostMapping("/promotions")
    public Map<String, Object> addPromotion(@RequestBody NewPromotion req, HttpSession session) {
        requireAdmin(session);
        int emailed = promotionService.create(req.code(), req.description(),
                req.discountPercent(), req.startDate(), req.endDate());
        return Map.of("message", "Promotion created. Emailed " + emailed + " subscriber"
                + (emailed == 1 ? "" : "s") + ".");
    }

    private void requireAdmin(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required."));
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins only.");
        }
    }
}
