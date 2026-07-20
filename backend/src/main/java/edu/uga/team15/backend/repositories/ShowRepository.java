package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    /** Showtimes on a movie's detail page, soonest first. */
    List<Show> findByMovieIdAndStartsAtAfterOrderByStartsAt(Long movieId, LocalDateTime after);

    /** The scheduling-conflict check: is this room already taken at this time? */
    boolean existsByShowroomIdAndStartsAt(Long showroomId, LocalDateTime startsAt);

    /** Everything an admin sees on the schedule page. */
    List<Show> findAllByOrderByStartsAt();
}
