package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.Show;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    /**
     * Serializes checkout for one show. A second payment waits, then sees the
     * tickets committed by the first payment before it can reserve seats.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Show s WHERE s.id = :id")
    Optional<Show> findByIdForUpdate(Long id);

    /** Showtimes on a movie's detail page, soonest first. */
    List<Show> findByMovieIdAndStartsAtAfterOrderByStartsAt(Long movieId, LocalDateTime after);

    /** The scheduling-conflict check: is this room already taken at this time? */
    boolean existsByShowroomIdAndStartsAt(Long showroomId, LocalDateTime startsAt);

    /** Used by the seeder to tell a stale schedule from a fresh one. */
    boolean existsByStartsAtAfter(LocalDateTime after);

    /** Everything an admin sees on the schedule page. */
    List<Show> findAllByOrderByStartsAt();

    /** Every upcoming show, for the home page date filter. */
    List<Show> findByStartsAtAfterOrderByStartsAt(LocalDateTime after);
}
