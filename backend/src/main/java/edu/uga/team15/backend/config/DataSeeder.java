package edu.uga.team15.backend.config;

import edu.uga.team15.backend.models.Movie;
import edu.uga.team15.backend.models.MovieStatus;
import edu.uga.team15.backend.models.PaymentCard;
import edu.uga.team15.backend.models.Role;
import edu.uga.team15.backend.models.User;
import edu.uga.team15.backend.models.UserStatus;
import edu.uga.team15.backend.repositories.MovieRepository;
import edu.uga.team15.backend.repositories.PaymentCardRepository;
import edu.uga.team15.backend.repositories.UserRepository;
import edu.uga.team15.backend.services.CardCipher;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Seeds the database on startup if it is empty: the movie catalog plus one
 * admin account so the admin portal redirect can be demoed.
 * Registration only ever creates customers, so this is the only way in.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final PaymentCardRepository paymentCardRepository;
    private final CardCipher cardCipher;

    private static final List<String> SHOWTIMES = List.of("2:00 PM", "5:00 PM", "8:00 PM");

    public DataSeeder(MovieRepository movieRepository, 
                      UserRepository userRepository,
                      PaymentCardRepository paymentCardRepository,
                      CardCipher cardCipher) {
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.paymentCardRepository = paymentCardRepository;
        this.cardCipher = cardCipher;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedMovies();
        seedDemoUsers();
    }

    private void seedAdmin() {
        if (userRepository.count() > 0) {
            return;
        }
        User admin = new User("CES", "Admin", "admin@ces.com",
                new BCryptPasswordEncoder().encode("admin1234"));
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        System.out.println("Seeded admin account: admin@ces.com / admin1234");
    }

    private void seedMovies() {
        if (movieRepository.count() > 0) {
            return; // already seeded
        }

        movieRepository.saveAll(List.of(
            new Movie("Inception", "Sci-Fi", "PG-13",
                "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
                "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "https://www.youtube.com/embed/YoHD9XEInc0",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("The Dark Knight", "Action", "PG-13",
                "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, facing the Joker.",
                "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "https://www.youtube.com/embed/EXeTwQWrcwY",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("Interstellar", "Sci-Fi", "PG-13",
                "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "https://www.youtube.com/embed/zSWdZVtXT7E",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("The Grand Budapest Hotel", "Comedy", "R",
                "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy.",
                "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
                "https://www.youtube.com/embed/1Fg5iWmQjwk",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("Coco", "Animation", "PG",
                "Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary singer.",
                "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
                "https://www.youtube.com/embed/Rvr68u6k5sI",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("Get Out", "Horror", "R",
                "A young Black man visits his white girlfriend's family estate and uncovers a disturbing secret.",
                "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
                "https://www.youtube.com/embed/DzfpyUB60YY",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("Mad Max: Fury Road", "Action", "R",
                "In a post-apocalyptic wasteland, Max teams up with Furiosa to flee a tyrant across the desert.",
                "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
                "https://www.youtube.com/embed/hEJnMQG9ev8",
                MovieStatus.CURRENTLY_RUNNING, SHOWTIMES),

            new Movie("La La Land", "Romance", "PG-13",
                "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.",
                "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
                "https://www.youtube.com/embed/0pdqf4P9MB8",
                MovieStatus.COMING_SOON, SHOWTIMES),

            new Movie("Dune: Part Two", "Sci-Fi", "PG-13",
                "Paul Atreides unites with the Fremen to wage war against the conspirators who destroyed his family.",
                "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                "https://www.youtube.com/embed/Way9Dexny3w",
                MovieStatus.COMING_SOON, SHOWTIMES),

            new Movie("Spider-Man: Across the Spider-Verse", "Animation", "PG",
                "Miles Morales journeys across the multiverse and meets a team of Spider-People tasked with protecting its existence.",
                "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                "https://www.youtube.com/embed/cqGjhVJWtEg",
                MovieStatus.COMING_SOON, SHOWTIMES),

            new Movie("A Quiet Place", "Horror", "PG-13",
                "A family must live in silence to avoid creatures that hunt by sound.",
                "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
                "https://www.youtube.com/embed/WR7cc5t7tv8",
                MovieStatus.COMING_SOON, SHOWTIMES),

            new Movie("Knives Out", "Comedy", "PG-13",
                "A detective investigates the death of the patriarch of an eccentric, combative family.",
                "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
                "https://www.youtube.com/embed/qGqiHJTsRkQ",
                MovieStatus.COMING_SOON, SHOWTIMES)
        ));

        System.out.println("Seeded " + movieRepository.count() + " movies.");
    }

    private void seedDemoUsers() throws Exception {
        // Prevent duplicate seeding if the script runs again
        if (paymentCardRepository.count() > 0) {
            return;
        }

        //  verified user with 3 pay cards for TC7
        User cardUser = new User("Joe", "Customer", "joe@cinemabook.com", 
                new BCryptPasswordEncoder().encode("JoePass!123"));
        cardUser.setRole(Role.CUSTOMER);
        cardUser.setStatus(UserStatus.ACTIVE);
        User savedCardUser = userRepository.save(cardUser);

        PaymentCard card1 = new PaymentCard(savedCardUser, "Visa", cardCipher.encrypt("4111111111113456"), "3456", 3, 2030);
        PaymentCard card2 = new PaymentCard(savedCardUser, "Mastercard", cardCipher.encrypt("5105105105102670"), "2670", 4, 2028);
        PaymentCard card3 = new PaymentCard(savedCardUser, "Amex", cardCipher.encrypt("340000000009374"), "9374", 9, 2026);
        paymentCardRepository.saveAll(List.of(card1, card2, card3));

        // verified user with favorites for test8 & test9
        User favUser = new User("Jane", "Doe", "jane@cinemabook.com", 
                new BCryptPasswordEncoder().encode("JanePass!123"));
        favUser.setRole(Role.CUSTOMER);
        favUser.setStatus(UserStatus.ACTIVE);
        
        List<Movie> allMovies = movieRepository.findAll();
        if (!allMovies.isEmpty()) {
            favUser.setFavorites(Set.of(allMovies.get(0))); // heart on 'Inception'
        }
        userRepository.save(favUser);

        System.out.println("Seeded demo users: joe@cinemabook.com and jane@cinemabook.com");
    }
}