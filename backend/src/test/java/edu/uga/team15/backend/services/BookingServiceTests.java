package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Booking;
import edu.uga.team15.backend.models.Show;
import edu.uga.team15.backend.models.Showroom;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.repositories.BookingRepository;
import edu.uga.team15.backend.repositories.ShowRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingServiceTests {

    private final ShowRepository showRepository = mock(ShowRepository.class);
    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final BookingService bookingService = new BookingService(showRepository, bookingRepository);

    @Test
    void acceptedPaymentCreatesConfirmedTicketsAndTotal() {
        User user = user(7L);
        Show show = show(12L);
        when(showRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(show));
        when(bookingRepository.findTakenSeatLabels(12L)).thenReturn(List.of("A1"));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(99L);
            return booking;
        });

        Booking booking = bookingService.processMockPayment(user, request(List.of("B2", "B3")));

        assertEquals(99L, booking.getId());
        assertEquals(2, booking.getTickets().size());
        assertEquals(List.of("B2", "B3"),
                booking.getTickets().stream().map(ticket -> ticket.getSeatLabel()).toList());
        assertEquals(31.06, booking.getTotalAmount());
        verify(showRepository).findByIdForUpdate(12L);
        verify(bookingRepository).save(booking);
    }

    @Test
    void seatPurchasedBeforePaymentIsRejectedWithoutCreatingBooking() {
        User user = user(7L);
        Show show = show(12L);
        when(showRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(show));
        when(bookingRepository.findTakenSeatLabels(12L)).thenReturn(List.of("B3"));

        BookingService.SeatUnavailableException error = assertThrows(
                BookingService.SeatUnavailableException.class,
                () -> bookingService.processMockPayment(user, request(List.of("B2", "B3"))));

        assertEquals("These seats were just purchased by someone else: B3.", error.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    private BookingService.PaymentRequest request(List<String> seats) {
        return new BookingService.PaymentRequest(
                12L,
                seats,
                new BookingService.Quantities(0, 2, 0),
                "buyer@example.com",
                "Test Buyer",
                "4242424242424242",
                "12/30",
                "123");
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private Show show(Long id) {
        Showroom room = new Showroom("Room 1", 5, 8);
        room.setId(3L);
        Show show = new Show();
        show.setId(id);
        show.setShowroom(room);
        show.setStartsAt(LocalDateTime.now().plusDays(1));
        return show;
    }
}
