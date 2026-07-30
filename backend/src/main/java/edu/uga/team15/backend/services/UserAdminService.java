package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Role;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.models.UserStatus;
import edu.uga.team15.backend.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin side of user accounts. Suspending is the only thing an admin changes
 * here, the customer still owns their own profile data.
 */
@Service
public class UserAdminService {

    private static final Logger log = LoggerFactory.getLogger(UserAdminService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserAdminService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public List<User> getAll() {
        return userRepository.findAllByOrderByIdAsc();
    }

    /**
     * Flips an account between ACTIVE and SUSPENDED. AuthService already blocks
     * SUSPENDED accounts at login, this is what actually sets it.
     */
    public User setStatus(Long targetId, String status, Long actingAdminId) {
        UserStatus next;
        try {
            next = UserStatus.valueOf(status);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Pick a status: active or suspended.");
        }
        if (next == UserStatus.INACTIVE) {
            throw new IllegalArgumentException("Inactive is set by email confirmation, not by an admin.");
        }

        User target = userRepository.findById(targetId == null ? -1 : targetId)
                .orElseThrow(() -> new IllegalArgumentException("That user no longer exists."));

        if (target.getId().equals(actingAdminId)) {
            throw new IllegalArgumentException("You can't change your own account status.");
        }
        if (target.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts can't be suspended.");
        }
        if (target.getStatus() == next) {
            throw new IllegalArgumentException(target.getEmail() + " is already " + next.name().toLowerCase() + ".");
        }

        target.setStatus(next);
        User saved = userRepository.save(target);

        emailService.sendAccountNotice(saved, next == UserStatus.SUSPENDED
                ? "your account has been suspended"
                : "your account has been reactivated");

        log.info("Admin id={} set user id={} status={}", actingAdminId, saved.getId(), next);
        return saved;
    }
}
