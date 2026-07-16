package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.AccountToken;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.models.UserStatus;
import edu.uga.team15.backend.repositories.AccountTokenRepository;
import edu.uga.team15.backend.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Registration, login and everything password related. Controllers stay dumb,
 * all the rules live here. Validation failures throw IllegalArgumentException
 * with a message the frontend can show directly.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AccountTokenRepository tokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository,
                       AccountTokenRepository tokenRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    /** Creates the account as INACTIVE and emails a confirmation link. */
    @Transactional
    public User register(String firstName, String lastName, String email,
                         String password, String phone, boolean promoOptIn) {
        if (isBlank(firstName) || isBlank(lastName) || isBlank(email) || isBlank(password)) {
            throw new IllegalArgumentException("First name, last name, email and password are required.");
        }
        email = email.trim().toLowerCase();
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User(firstName.trim(), lastName.trim(), email, encoder.encode(password));
        user.setPhone(phone == null ? null : phone.trim());
        user.setPromoOptIn(promoOptIn);
        user = userRepository.save(user);

        String token = newToken(user, AccountToken.Purpose.ACTIVATION, 24 * 60);
        emailService.sendActivationEmail(user, token);
        return user;
    }

    /** Flips the account to ACTIVE when the emailed link is clicked. */
    @Transactional
    public User activate(String token) {
        AccountToken t = validToken(token, AccountToken.Purpose.ACTIVATION,
                "This confirmation link is invalid or has expired.");
        User user = t.getUser();
        user.setStatus(UserStatus.ACTIVE);
        t.setUsed(true);
        return user;
    }

    /** Checks credentials and account status. Returns the user on success. */
    public User login(String email, String password) {
        if (isBlank(email) || isBlank(password)) {
            throw new IllegalArgumentException("Email and password are required.");
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new IllegalArgumentException("Account is not verified. Please check your email to verify your account.");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new IllegalArgumentException("This account has been suspended. Contact support for help.");
        }
        return user;
    }

    /**
     * Emails a reset link if the address matches an account. Silently does
     * nothing otherwise so the endpoint can't be used to probe for emails.
     */
    @Transactional
    public void forgotPassword(String email) {
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email is required.");
        }
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            String token = newToken(user, AccountToken.Purpose.PASSWORD_RESET, 60);
            emailService.sendPasswordResetEmail(user, token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (isBlank(newPassword) || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        AccountToken t = validToken(token, AccountToken.Purpose.PASSWORD_RESET,
                "This reset link is invalid or has expired. Request a new one.");
        User user = t.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        t.setUsed(true);
        emailService.sendAccountNotice(user, "Your password was just reset through the forgot-password link.");
    }

    /** Change password from the profile page - requires the current password. */
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (isBlank(currentPassword) || !encoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (isBlank(newPassword) || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }
        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);
        emailService.sendAccountNotice(user, "Your password was just changed from the profile page.");
    }

    private String newToken(User user, AccountToken.Purpose purpose, int minutesValid) {
        String token = UUID.randomUUID().toString();
        tokenRepository.save(new AccountToken(token, user, purpose,
                Instant.now().plus(minutesValid, ChronoUnit.MINUTES)));
        return token;
    }

    private AccountToken validToken(String token, AccountToken.Purpose purpose, String errorMessage) {
        if (isBlank(token)) {
            throw new IllegalArgumentException(errorMessage);
        }
        AccountToken t = tokenRepository.findByTokenAndPurpose(token.trim(), purpose)
                .orElseThrow(() -> new IllegalArgumentException(errorMessage));
        if (t.isUsed() || t.isExpired()) {
            throw new IllegalArgumentException(errorMessage);
        }
        return t;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
