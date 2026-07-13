package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.PaymentCard;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.UserRepository;
import edu.uga.team15.backend.services.AuthService;
import edu.uga.team15.backend.services.ProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Everything behind the profile page. All routes require a signed-in session -
 * requests without one get a 401 before touching any data, and users can only
 * ever reach their own rows since the id comes from the session, not the URL.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final ProfileService profileService;
    private final AuthService authService;

    public UserController(UserRepository userRepository, ProfileService profileService,
                          AuthService authService) {
        this.userRepository = userRepository;
        this.profileService = profileService;
        this.authService = authService;
    }

    /** Full profile for the edit form: info + address + masked cards. */
    @GetMapping("/profile")
    public Map<String, Object> getProfile(HttpSession session) {
        User user = currentUser(session);

        Map<String, Object> out = new HashMap<>();
        out.put("id", user.getId());
        out.put("firstName", user.getFirstName());
        out.put("lastName", user.getLastName());
        out.put("email", user.getEmail());
        out.put("phone", user.getPhone());
        out.put("role", user.getRole().name());
        out.put("promoOptIn", user.isPromoOptIn());
        out.put("address", profileService.getAddress(user.getId()).orElse(null));
        out.put("cards", profileService.getCards(user.getId()));
        return out;
    }

    record ProfileUpdate(String firstName, String lastName, String phone, Boolean promoOptIn) {}

    /** Email is not accepted here on purpose - it can't be changed. */
    @PutMapping("/profile")
    public Map<String, String> updateProfile(@RequestBody ProfileUpdate req, HttpSession session) {
        User user = currentUser(session);
        profileService.updateProfile(user, req.firstName(), req.lastName(),
                req.phone(), Boolean.TRUE.equals(req.promoOptIn()));
        return Map.of("message", "Profile saved.");
    }

    record PasswordChange(String currentPassword, String newPassword) {}

    @PutMapping("/password")
    public Map<String, String> changePassword(@RequestBody PasswordChange req, HttpSession session) {
        User user = currentUser(session);
        authService.changePassword(user, req.currentPassword(), req.newPassword());
        return Map.of("message", "Password changed.");
    }

    record AddressUpdate(String street, String city, String state, String zip) {}

    @PutMapping("/address")
    public Map<String, String> saveAddress(@RequestBody AddressUpdate req, HttpSession session) {
        User user = currentUser(session);
        profileService.saveAddress(user, req.street(), req.city(), req.state(), req.zip());
        return Map.of("message", "Address saved.");
    }

    @DeleteMapping("/address")
    public Map<String, String> deleteAddress(HttpSession session) {
        profileService.deleteAddress(currentUser(session));
        return Map.of("message", "Address removed.");
    }

    @GetMapping("/cards")
    public List<PaymentCard> getCards(HttpSession session) {
        return profileService.getCards(currentUser(session).getId());
    }

    record NewCard(String cardNumber, Integer expMonth, Integer expYear) {}

    @PostMapping("/cards")
    public PaymentCard addCard(@RequestBody NewCard req, HttpSession session) {
        User user = currentUser(session);
        return profileService.addCard(user, req.cardNumber(),
                req.expMonth() == null ? 0 : req.expMonth(),
                req.expYear() == null ? 0 : req.expYear());
    }

    @DeleteMapping("/cards/{id}")
    public Map<String, String> deleteCard(@PathVariable Long id, HttpSession session) {
        profileService.deleteCard(currentUser(session), id);
        return Map.of("message", "Card removed.");
    }

    @GetMapping("/favorites")
    public List<Movie> getFavorites(HttpSession session) {
        return profileService.getFavorites(currentUser(session).getId());
    }

    @PostMapping("/favorites/{movieId}")
    public Map<String, String> addFavorite(@PathVariable Long movieId, HttpSession session) {
        profileService.addFavorite(currentUser(session).getId(), movieId);
        return Map.of("message", "Added to favorites.");
    }

    @DeleteMapping("/favorites/{movieId}")
    public Map<String, String> removeFavorite(@PathVariable Long movieId, HttpSession session) {
        profileService.removeFavorite(currentUser(session).getId(), movieId);
        return Map.of("message", "Removed from favorites.");
    }

    private User currentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required.");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required."));
    }
}
