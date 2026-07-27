package edu.uga.team15.backend.controllers;

import edu.uga.team15.backend.models.Booking;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.UserRepository;
import edu.uga.team15.backend.services.BookingService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public CheckoutController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/payment")
    public ResponseEntity<?> processPayment(@RequestBody BookingService.PaymentRequest request,
                                            HttpSession session) {
        try {
            Booking booking = bookingService.processMockPayment(currentUser(session), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "bookingId", booking.getId(),
                    "paymentReference", booking.getPaymentReference(),
                    "total", booking.getTotalAmount(),
                    "seats", booking.getTickets().stream().map(t -> t.getSeatLabel()).toList(),
                    "message", "Payment accepted. Your seats are confirmed."));
        } catch (BookingService.SeatUnavailableException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", exception.getMessage(), "code", "SEATS_UNAVAILABLE"));
        } catch (BookingService.PaymentDeclinedException exception) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(Map.of("error", exception.getMessage(), "code", "PAYMENT_DECLINED"));
        }
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
