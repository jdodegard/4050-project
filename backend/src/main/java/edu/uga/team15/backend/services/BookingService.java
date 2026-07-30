package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Booking;
import edu.uga.team15.backend.models.PaymentCard;
import edu.uga.team15.backend.models.Show;
import edu.uga.team15.backend.models.Showroom;
import edu.uga.team15.backend.models.Ticket;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.BookingRepository;
import edu.uga.team15.backend.repositories.PaymentCardRepository;
import edu.uga.team15.backend.repositories.ShowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingService {

    public static final double CHILD_PRICE = 8.99;
    public static final double ADULT_PRICE = 12.99;
    public static final double SENIOR_PRICE = 9.99;
    private static final double BOOKING_FEE = 1.50;
    private static final double TAX_RATE = 0.08;
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final PaymentCardRepository paymentCardRepository;
    private final CardCipher cardCipher;
    private final ShowService showService;

    @Autowired
    public BookingService(ShowRepository showRepository, BookingRepository bookingRepository,
                          EmailService emailService, PaymentCardRepository paymentCardRepository,
                          CardCipher cardCipher, ShowService showService) {
        this.showRepository = showRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.paymentCardRepository = paymentCardRepository;
        this.cardCipher = cardCipher;
        this.showService = showService;
    }

    /** Kept so existing unit tests that construct this directly still compile and pass unchanged. */
    public BookingService(ShowRepository showRepository, BookingRepository bookingRepository) {
        this(showRepository, bookingRepository, null, null, null, null);
    }

    /**
     * Mock payment and seat purchase happen in one transaction. Locking the
     * show makes the taken-seat check and ticket inserts atomic per show.
     */
    @Transactional
    public Booking processMockPayment(User user, PaymentRequest request) {
        request = resolveSavedCard(user, request);
        validatePayment(request);

        Show show = showRepository.findByIdForUpdate(request.showId())
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found."));
        if (show.getStartsAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This showtime has already started.");
        }

        List<TicketSpec> ticketSpecs = ticketSpecs(request.quantities());
        Set<String> taken = new HashSet<>(bookingRepository.findTakenSeatLabels(show.getId()));
        int availableSeats = show.getShowroom().getCapacity() - taken.size();
        if (ticketSpecs.size() > availableSeats) {
            throw new SeatUnavailableException(
                    "Only " + availableSeats + " seat" + (availableSeats == 1 ? " is" : "s are")
                            + " currently available for this showtime.");
        }

        List<String> seats = normalizeSeats(request.seats(), show.getShowroom());
        if (seats.size() != ticketSpecs.size()) {
            throw new IllegalArgumentException("The number of seats must match the number of tickets.");
        }

        List<String> unavailable = seats.stream().filter(taken::contains).toList();
        if (!unavailable.isEmpty()) {
            throw new SeatUnavailableException(
                    "These seats were just purchased by someone else: " + String.join(", ", unavailable) + ".");
        }

        if (isDeclinedTestCard(request.cardNumber())) {
            log.info("Mock payment declined for user id={} show id={}", user.getId(), show.getId());
            throw new PaymentDeclinedException("The mock payment was declined. Try card 4242 4242 4242 4242.");
        }

        Booking booking = new Booking(user, show);
        booking.setConfirmationEmail(normalizeEmail(request.email()));
        booking.setTotalAmount(calculateTotal(ticketSpecs));
        booking.setPaymentReference("MOCK-" + UUID.randomUUID());

        for (int i = 0; i < seats.size(); i++) {
            TicketSpec spec = ticketSpecs.get(i);
            booking.addTicket(new Ticket(seats.get(i), spec.type(), spec.price()));
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Accepted mock payment reference={} booking id={} user id={} show id={} seats={}",
                saved.getPaymentReference(), saved.getId(), user.getId(), show.getId(), seats);

        if (showService != null) {
            for (String seat : seats) {
                showService.markBooked(show.getId(), seat);
            }
        }
        if (emailService != null) {
            emailService.sendBookingConfirmation(saved);
        }
        return saved;
    }

    /**
     * Swaps the raw card fields for a saved card's decrypted number/expiry when
     * the request points at one, so a returning customer doesn't retype it.
     * The full number is only ever decrypted here, server-side - never sent
     * back to the client.
     */
    private PaymentRequest resolveSavedCard(User user, PaymentRequest request) {
        if (request == null || request.savedCardId() == null
                || paymentCardRepository == null || cardCipher == null) {
            return request;
        }
        PaymentCard card = paymentCardRepository.findById(request.savedCardId())
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Saved card not found."));

        String decryptedNumber = cardCipher.decrypt(card.getCardNumberEnc());
        String expiry = String.format("%02d/%02d", card.getExpMonth(), card.getExpYear() % 100);
        String nameOnCard = isBlank(request.nameOnCard())
                ? user.getFirstName() + " " + user.getLastName() : request.nameOnCard();

        return new PaymentRequest(request.showId(), request.seats(), request.quantities(),
                request.email(), nameOnCard, decryptedNumber, expiry, request.cvv(), request.savedCardId());
    }

    private void validatePayment(PaymentRequest request) {
        if (request == null || isBlank(request.nameOnCard())) {
            throw new IllegalArgumentException("Name on card is required.");
        }
        String digits = digits(request.cardNumber());
        if (!digits.matches("\\d{16}")) {
            throw new IllegalArgumentException("Enter a 16-digit card number.");
        }
        if (!passesLuhn(digits)) {
            throw new IllegalArgumentException("Enter a valid mock card number.");
        }
        if (isBlank(request.cvv()) || !request.cvv().trim().matches("\\d{3,4}")) {
            throw new IllegalArgumentException("CVV must be 3 or 4 digits.");
        }
        if (isBlank(request.expiry()) || !request.expiry().trim().matches("(0[1-9]|1[0-2])/\\d{2}")) {
            throw new IllegalArgumentException("Expiry must use MM/YY.");
        }
        String[] expiry = request.expiry().trim().split("/");
        YearMonth expires = YearMonth.of(2000 + Integer.parseInt(expiry[1]), Integer.parseInt(expiry[0]));
        if (expires.isBefore(YearMonth.now())) {
            throw new IllegalArgumentException("This card is expired.");
        }
    }

    private List<String> normalizeSeats(List<String> requested, Showroom room) {
        if (requested == null || requested.isEmpty()) {
            throw new IllegalArgumentException("Select at least one seat.");
        }
        List<String> seats = requested.stream()
                .map(s -> s == null ? "" : s.trim().toUpperCase(Locale.ROOT))
                .sorted()
                .toList();
        if (new HashSet<>(seats).size() != seats.size()) {
            throw new IllegalArgumentException("Each selected seat must be unique.");
        }
        for (String seat : seats) {
            if (!validSeat(seat, room)) {
                throw new IllegalArgumentException("Invalid seat: " + seat + ".");
            }
        }
        return seats;
    }

    private boolean validSeat(String seat, Showroom room) {
        if (!seat.matches("[A-Z]\\d+")) return false;
        int row = seat.charAt(0) - 'A';
        int number = Integer.parseInt(seat.substring(1));
        return row >= 0 && row < room.getSeatRows()
                && number >= 1 && number <= room.getSeatsPerRow();
    }

    private List<TicketSpec> ticketSpecs(Quantities quantities) {
        if (quantities == null) {
            throw new IllegalArgumentException("Ticket quantities are required.");
        }
        List<TicketSpec> tickets = new ArrayList<>();
        addTickets(tickets, "CHILD", CHILD_PRICE, quantities.child());
        addTickets(tickets, "ADULT", ADULT_PRICE, quantities.adult());
        addTickets(tickets, "SENIOR", SENIOR_PRICE, quantities.senior());
        if (tickets.isEmpty()) {
            throw new IllegalArgumentException("Select at least one ticket.");
        }
        return tickets;
    }

    private void addTickets(List<TicketSpec> tickets, String type, double price, Integer count) {
        int quantity = count == null ? 0 : count;
        if (quantity < 0 || quantity > 20) {
            throw new IllegalArgumentException("Ticket quantities must be between 0 and 20.");
        }
        for (int i = 0; i < quantity; i++) {
            tickets.add(new TicketSpec(type, price));
        }
    }

    private double calculateTotal(List<TicketSpec> tickets) {
        double subtotal = tickets.stream().mapToDouble(TicketSpec::price).sum();
        double total = subtotal + tickets.size() * BOOKING_FEE + subtotal * TAX_RATE;
        return BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String normalizeEmail(String email) {
        if (isBlank(email) || !email.trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Enter a valid confirmation email.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isDeclinedTestCard(String cardNumber) {
        return "4000000000000002".equals(digits(cardNumber));
    }

    private boolean passesLuhn(String digits) {
        int sum = 0;
        boolean doubleDigit = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int digit = digits.charAt(i) - '0';
            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            doubleDigit = !doubleDigit;
        }
        return sum % 10 == 0;
    }

    private String digits(String value) {
        return value == null ? "" : value.replaceAll("[\\s-]", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record PaymentRequest(Long showId, List<String> seats, Quantities quantities,
                                 String email, String nameOnCard, String cardNumber,
                                 String expiry, String cvv, Long savedCardId) {

        /** Kept so existing call sites (and the unit tests) building the old 8-field shape still compile. */
        public PaymentRequest(Long showId, List<String> seats, Quantities quantities,
                              String email, String nameOnCard, String cardNumber,
                              String expiry, String cvv) {
            this(showId, seats, quantities, email, nameOnCard, cardNumber, expiry, cvv, null);
        }
    }

    public record Quantities(Integer child, Integer adult, Integer senior) {}

    private record TicketSpec(String type, double price) {}

    public static class SeatUnavailableException extends IllegalArgumentException {
        public SeatUnavailableException(String message) { super(message); }
    }

    public static class PaymentDeclinedException extends IllegalArgumentException {
        public PaymentDeclinedException(String message) { super(message); }
    }
}
