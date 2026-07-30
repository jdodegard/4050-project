package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    /** The full seat inventory for a show - what the seat map is built from. */
    List<ShowSeat> findByShowId(Long showId);

    /** Just the taken labels, for the "greyed out" set on the seat map. */
    @Query("SELECT s.seatLabel FROM ShowSeat s WHERE s.show.id = :showId AND s.status = :status")
    List<String> findSeatLabelsByShowIdAndStatus(Long showId, ShowSeat.Status status);

    Optional<ShowSeat> findByShowIdAndSeatLabel(Long showId, String seatLabel);
}
