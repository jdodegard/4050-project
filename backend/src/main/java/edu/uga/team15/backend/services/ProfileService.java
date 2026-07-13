package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Address;
import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.PaymentCard;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.AddressRepository;
import edu.uga.team15.backend.repositories.MovieRepository;
import edu.uga.team15.backend.repositories.PaymentCardRepository;
import edu.uga.team15.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Everything the profile page can edit: personal info, the one saved address,
 * payment cards (max 3, encrypted) and the favorite movies list.
 * Every change fires a notification email per the security requirements.
 */
@Service
public class ProfileService {

    public static final int MAX_CARDS = 3;

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PaymentCardRepository cardRepository;
    private final MovieRepository movieRepository;
    private final CardCipher cardCipher;
    private final EmailService emailService;

    public ProfileService(UserRepository userRepository,
                          AddressRepository addressRepository,
                          PaymentCardRepository cardRepository,
                          MovieRepository movieRepository,
                          CardCipher cardCipher,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cardRepository = cardRepository;
        this.movieRepository = movieRepository;
        this.cardCipher = cardCipher;
        this.emailService = emailService;
    }

    public Optional<Address> getAddress(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public List<PaymentCard> getCards(Long userId) {
        return cardRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    /** Name, phone and promo opt-in. Email is intentionally not editable. */
    @Transactional
    public User updateProfile(User user, String firstName, String lastName,
                              String phone, boolean promoOptIn) {
        if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("First and last name are required.");
        }
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setPhone(phone == null ? null : phone.trim());
        user.setPromoOptIn(promoOptIn);
        user = userRepository.save(user);
        emailService.sendAccountNotice(user, "Your profile information was just updated.");
        return user;
    }

    /** Creates or replaces the user's single saved address. */
    @Transactional
    public Address saveAddress(User user, String street, String city, String state, String zip) {
        if (isBlank(street) || isBlank(city) || isBlank(state) || isBlank(zip)) {
            throw new IllegalArgumentException("Street, city, state and ZIP are all required.");
        }
        Address address = addressRepository.findByUserId(user.getId())
                .orElseGet(() -> new Address(user, null, null, null, null));
        address.setStreet(street.trim());
        address.setCity(city.trim());
        address.setState(state.trim());
        address.setZip(zip.trim());
        address = addressRepository.save(address);
        emailService.sendAccountNotice(user, "The address on your account was just updated.");
        return address;
    }

    @Transactional
    public void deleteAddress(User user) {
        addressRepository.deleteByUserId(user.getId());
        emailService.sendAccountNotice(user, "The address on your account was just removed.");
    }

    /** Validates, encrypts and stores a card. Enforces the 3-card limit. */
    @Transactional
    public PaymentCard addCard(User user, String cardNumber, int expMonth, int expYear) {
        if (cardRepository.countByUserId(user.getId()) >= MAX_CARDS) {
            throw new IllegalArgumentException("You can store up to " + MAX_CARDS + " payment cards. Remove one to add another.");
        }

        String digits = cardNumber == null ? "" : cardNumber.replaceAll("[\\s-]", "");
        if (!digits.matches("\\d{13,19}")) {
            throw new IllegalArgumentException("Card number should be 13-19 digits.");
        }
        if (expMonth < 1 || expMonth > 12) {
            throw new IllegalArgumentException("Expiration month must be between 1 and 12.");
        }
        if (YearMonth.of(expYear, expMonth).isBefore(YearMonth.now())) {
            throw new IllegalArgumentException("This card is already expired.");
        }

        PaymentCard card = new PaymentCard(user, detectCardType(digits),
                cardCipher.encrypt(digits), digits.substring(digits.length() - 4),
                expMonth, expYear);
        card = cardRepository.save(card);
        emailService.sendAccountNotice(user, "A payment card ending in " + card.getLast4() + " was just added to your account.");
        return card;
    }

    @Transactional
    public void deleteCard(User user, Long cardId) {
        PaymentCard card = cardRepository.findById(cardId)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Card not found."));
        cardRepository.delete(card);
        emailService.sendAccountNotice(user, "The payment card ending in " + card.getLast4() + " was just removed from your account.");
    }

    @Transactional
    public List<Movie> getFavorites(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return new ArrayList<>(user.getFavorites());
    }

    @Transactional
    public void addFavorite(Long userId, Long movieId) {
        User user = userRepository.findById(userId).orElseThrow();
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found."));
        user.getFavorites().add(movie);
        userRepository.save(user);
    }

    @Transactional
    public void removeFavorite(Long userId, Long movieId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.getFavorites().removeIf(m -> m.getId().equals(movieId));
        userRepository.save(user);
    }

    private String detectCardType(String digits) {
        if (digits.startsWith("4")) return "Visa";
        if (digits.matches("^5[1-5].*") || digits.matches("^2[2-7].*")) return "Mastercard";
        if (digits.startsWith("34") || digits.startsWith("37")) return "Amex";
        if (digits.startsWith("6")) return "Discover";
        return "Card";
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
