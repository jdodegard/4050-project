package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.Show;
import edu.uga.team15.backend.models.ShowSeat;
import edu.uga.team15.backend.models.Showroom;
import edu.uga.team15.backend.repositories.MovieRepository;
import edu.uga.team15.backend.repositories.ShowRepository;
import edu.uga.team15.backend.repositories.ShowSeatRepository;
import edu.uga.team15.backend.repositories.ShowroomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Scheduling and seat availability. The conflict rule lives here: one showroom
 * can only hold one show at a given start time.
 */
@Service
public class ShowService {

    private static final Logger log = LoggerFactory.getLogger(ShowService.class);

    private final ShowRepository showRepository;
    private final ShowroomRepository showroomRepository;
    private final MovieRepository movieRepository;
    private final ShowSeatRepository showSeatRepository;

    public ShowService(ShowRepository showRepository, ShowroomRepository showroomRepository,
                       MovieRepository movieRepository, ShowSeatRepository showSeatRepository) {
        this.showRepository = showRepository;
        this.showroomRepository = showroomRepository;
        this.movieRepository = movieRepository;
        this.showSeatRepository = showSeatRepository;
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
                "taken", showSeatRepository.findSeatLabelsByShowIdAndStatus(showId, ShowSeat.Status.BOOKED));
    }

    /** One ShowSeat per seat in the room, so seat state is a real row per show. Also used by DataSeeder. */
    public void generateSeatsFor(Show show) {
        Showroom room = show.getShowroom();
        List<ShowSeat> seats = new ArrayList<>();
        for (int r = 0; r < room.getSeatRows(); r++) {
            char rowLetter = (char) ('A' + r);
            for (int n = 1; n <= room.getSeatsPerRow(); n++) {
                seats.add(new ShowSeat(show, rowLetter + String.valueOf(n)));
            }
        }
        showSeatRepository.saveAll(seats);
    }

    /** Marks one seat sold. Used by seed data and by BookingService after a real payment. */
    public void markBooked(Long showId, String seatLabel) {
        showSeatRepository.findByShowIdAndSeatLabel(showId, seatLabel).ifPresent(seat -> {
            seat.setStatus(ShowSeat.Status.BOOKED);
            showSeatRepository.save(seat);
        });
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

        Show show = showRepository.save(new Show(movie, room, startsAt));
        generateSeatsFor(show);
        log.info("Scheduled show id={} movieId={} showroomId={} startsAt={}",
                show.getId(), movie.getId(), room.getId(), startsAt);
        return show;
    }
}
