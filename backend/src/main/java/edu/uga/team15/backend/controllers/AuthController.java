package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.UserRepository;
import edu.uga.team15.backend.services.AuthService;
import edu.uga.team15.backend.services.ProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Registration, login/logout and the password flows. Login puts the user id
 * in the HTTP session; everything under /api/user reads it back out.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ProfileService profileService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, ProfileService profileService,
                          UserRepository userRepository) {
        this.authService = authService;
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    record AddressPayload(String street, String city, String state, String zip) {}
    record CardPayload(String cardNumber, Integer expMonth, Integer expYear) {}
    record RegisterRequest(String firstName, String lastName, String email, String password,
                           String phone, Boolean promoOptIn,
                           AddressPayload address, CardPayload card) {}

    /**
     * Creates the account (status INACTIVE) and sends the confirmation email.
     * Address and card are optional extras on the registration form.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        User user = authService.register(req.firstName(), req.lastName(), req.email(),
                req.password(), req.phone(), Boolean.TRUE.equals(req.promoOptIn()));

        if (req.address() != null && notBlank(req.address().street())) {
            profileService.saveAddress(user, req.address().street(), req.address().city(),
                    req.address().state(), req.address().zip());
        }
        if (req.card() != null && notBlank(req.card().cardNumber())) {
            profileService.addCard(user, req.card().cardNumber(),
                    req.card().expMonth() == null ? 0 : req.card().expMonth(),
                    req.card().expYear() == null ? 0 : req.card().expYear());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Account created! Check your email for a confirmation link to activate it."));
    }

    /** Called by the frontend when the user clicks the emailed link. */
    @PostMapping("/activate")
    public Map<String, String> activate(@RequestBody Map<String, String> body) {
        authService.activate(body.get("token"));
        return Map.of("message", "Your account is confirmed. You can sign in now!");
    }

    record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req, HttpSession session) {
        User user = authService.login(req.email(), req.password());
        session.setAttribute("userId", user.getId());
        return summary(user);
    }

    /** Kills the session. The navbar calls this from the Sign Out button. */
    @PostMapping("/logout")
    public Map<String, String> logout(HttpSession session) {
        session.invalidate();
        return Map.of("message", "Signed out.");
    }

    /** Who is currently signed in (used to restore state on page refresh). */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not signed in."));
        }
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(summary(u)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not signed in.")));
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return Map.of("message", "If that email matches an account, a reset link is on its way.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return Map.of("message", "Password updated. You can sign in with the new one now.");
    }

    private Map<String, Object> summary(User user) {
        return Map.of(
                "id", user.getId(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "role", user.getRole().name());
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
