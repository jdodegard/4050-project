package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.Show;
import edu.uga.team15.backend.models.Showroom;
import edu.uga.team15.backend.repositories.BookingRepository;
import edu.uga.team15.backend.repositories.MovieRepository;
import edu.uga.team15.backend.repositories.ShowRepository;
import edu.uga.team15.backend.repositories.ShowroomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

/**
 * Scheduling and seat availability. The conflict rule lives here: one showroom
 * can only hold one show at a given start time.
 */
@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final ShowroomRepository showroomRepository;
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    public ShowService(ShowRepository showRepository, ShowroomRepository showroomRepository,
                       MovieRepository movieRepository, BookingRepository bookingRepository) {
        this.showRepository = showRepository;
        this.showroomRepository = showroomRepository;
        this.movieRepository = movieRepository;
        this.bookingRepository = bookingRepository;
    }

    /** Upcoming showtimes for a movie's detail page. */
    public List<Show> getUpcomingForMovie(Long movieId) {
        return showRepository.findByMovieIdAndStartsAtAfterOrderByStartsAt(movieId, LocalDateTime.now());
    }

    public List<Show> getAll() {
        return showRepository.findAllByOrderByStartsAt();
    }

    public List<Showroom> getShowrooms() {
        return showroomRepository.findAll();
    }

    /** Seat layout plus which seats are already sold, for the seat map. */
    public Map<String, Object> getSeatMap(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new IllegalArgumentException("Show not found."));
        Showroom room = show.getShowroom();
        return Map.of(
                "showId", show.getId(),
                "showroom", room.getName(),
                "seatRows", room.getSeatRows(),
                "seatsPerRow", room.getSeatsPerRow(),
                "taken", bookingRepository.findTakenSeatLabels(showId));
    }

    /** Admin scheduling. Date and time come in as strings straight off the form. */
    public Show schedule(Long movieId, Long showroomId, String date, String time) {
        Movie movie = movieRepository.findById(movieId == null ? -1 : movieId)
                .orElseThrow(() -> new IllegalArgumentException("Pick a movie to schedule."));
        Showroom room = showroomRepository.findById(showroomId == null ? -1 : showroomId)
                .orElseThrow(() -> new IllegalArgumentException("Pick a showroom."));

        LocalDateTime startsAt;
        try {
            startsAt = LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
        } catch (DateTimeParseException | NullPointerException e) {
            throw new IllegalArgumentException("Enter a valid date and time.");
        }

        if (startsAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Showtime must be in the future.");
        }
        if (showRepository.existsByShowroomIdAndStartsAt(room.getId(), startsAt)) {
            throw new IllegalArgumentException(
                    room.getName() + " already has a show at that time. Pick a different time or room.");
        }

        return showRepository.save(new Show(movie, room, startsAt));
    }
}
