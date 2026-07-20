package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** Seat labels already sold for a show - what the seat map greys out. */
    @Query("SELECT t.seatLabel FROM Ticket t WHERE t.booking.show.id = :showId AND t.booking.status <> 'CANCELLED'")
    List<String> findTakenSeatLabels(Long showId);
}
