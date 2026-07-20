package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Promotion;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.PromotionRepository;
import edu.uga.team15.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Admin-created promo codes. Creating one emails every user who opted in
 * to promotional emails - nobody else.
 */
@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PromotionService(PromotionRepository promotionRepository, UserRepository userRepository,
                            EmailService emailService) {
        this.promotionRepository = promotionRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /** Validates, saves and emails the subscribers. Returns how many emails went out. */
    @Transactional
    public int create(String code, String description, Integer discountPercent,
                      String startDate, String endDate) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Promo code is required.");
        }
        code = code.trim().toUpperCase();
        if (promotionRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("That promo code already exists.");
        }
        if (discountPercent == null || discountPercent < 1 || discountPercent > 100) {
            throw new IllegalArgumentException("Discount must be between 1 and 100 percent.");
        }

        LocalDate start, end;
        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new IllegalArgumentException("Enter valid start and end dates.");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date can't be before the start date.");
        }

        Promotion promo = promotionRepository.save(
                new Promotion(code, description, discountPercent, start, end));

        List<User> subscribers = userRepository.findByPromoOptInTrue();
        subscribers.forEach(u -> emailService.sendPromotionEmail(u, promo));
        return subscribers.size();
    }

    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }
}
