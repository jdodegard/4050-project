-- This file populates the data into MySQL, including dummy data for 10 movies as per Deliverable 2

DROP TABLE IF EXISTS Movies;
DROP TABLE IF EXISTS Showtimes;


CREATE TABLE Movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    rating VARCHAR(10) NOT NULL,       
    description TEXT NOT NULL,
    poster_url VARCHAR(500) NOT NULL,  
    trailer_url VARCHAR(500) NOT NULL, 
    genre VARCHAR(100) NOT NULL,       
    showing_status VARCHAR(50) NOT NULL CHECK (showing_status IN ('Currently Running', 'Coming Soon'))
);

CREATE TABLE Showtimes (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT,
    show_date DATE NOT NULL,           
    show_time VARCHAR(20) NOT NULL,    -- Hardcoded intervals (e.g., '2:00 PM')
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE
);

INSERT INTO Movies (movie_id, title, rating, description, poster_url, trailer_url, genre, showing_status) VALUES
-- Currently Running
(1, 'Toy Story 5', 'G', 'The legendary toy gang faces a modern tech challenge as digital devices disrupt the play ecosystem.', 'https://placehold.co/300x450?text=Toy+Story+5', 'https://www.youtube.com/embed/QftAW9TTmuQ', 'Animation', 'Currently Running'),
(2, 'Supergirl', 'PG-13', 'Kara Zor-El travels the cosmos to move beyond her past and claim her identity as a powerful hero.', 'https://placehold.co/300x450?text=Supergirl', 'https://www.youtube.com/embed/tzlY8XD1CGg', 'Action', 'Currently Running'),
(3, 'Disclosure Day', 'PG-13', 'A high-stakes science fiction thriller logging the societal fallout of an sudden planetary discovery.', 'https://placehold.co/300x450?text=Disclosure+Day', 'https://www.youtube.com/embed/icDuEHSxE-w', 'Sci-Fi', 'Currently Running'),
(4, 'The Death of Robin Hood', 'R', 'An aging outlaw finds himself gravely wounded and facing his history while under the care of a mysterious stranger.', 'https://placehold.co/300x450?text=The+Death+of+Robin+Hood', 'https://www.youtube.com/embed/tlSDDuWxO_0', 'Drama', 'Currently Running'),
(5, 'Power Ballad', 'R', 'A past-his-prime wedding vocalist is thrown into a chaotic partnership with an unstable boy-band performer.', 'https://placehold.co/300x450?text=Power+Ballad', 'https://www.youtube.com/embed/-faiHUsbP_U', 'Comedy', 'Currently Running'),

-- Coming Soon
(6, 'Minions & Monsters', 'PG', 'Gru and his yellow companions embark on a hilarious journey deep into an enchanted world filled with chaotic creatures.', 'https://placehold.co/300x450?text=Minions+%26+Monsters', 'https://www.youtube.com/embed/V-O-uBaHk3c', 'Animation', 'Coming Soon'),
(7, 'Moana', 'PG', 'The highly-anticipated live-action adaptation tracing the classic ocean voyage with Maui and Moana.', 'https://placehold.co/300x450?text=Moana', 'https://www.youtube.com/embed/EEz5xbzYPKI', 'Adventure', 'Coming Soon'),
(8, 'The Odyssey', 'R', 'An expansive historical drama following structural conflicts across a demanding ocean navigation campaign.', 'https://placehold.co/300x450?text=The+Odyssey', 'https://www.youtube.com/embed/f_bKjZeJBBI', 'Adventure', 'Coming Soon'),
(9, 'Spider-Man: Brand New Day', 'PG-13', 'Peter Parker navigates shifting alliances and complex threats to defend his city from collapse.', 'https://placehold.co/300x450?text=Spider-Man%3A+Brand+New+Day', 'https://www.youtube.com/embed/62bIsvRcPv0', 'Action', 'Coming Soon'),
(10, 'Ice Cream Man', 'R', 'A nostalgic suburban truck harbors deep horrors when local neighborhoods discover what its freezer actually contains.', 'https://placehold.co/300x450?text=Ice+Cream+Man', 'https://www.youtube.com/embed/BjtVXWa3tWI', 'Horror', 'Coming Soon');


INSERT INTO Showtimes (movie_id, show_date, show_time) VALUES
-- Toy Story 5
(1, '2026-06-30', '2:00 PM'),
(1, '2026-06-30', '5:00 PM'),
(1, '2026-06-30', '8:00 PM'),

-- Supergirl
(2, '2026-06-30', '2:00 PM'),
(2, '2026-06-30', '5:00 PM'),
(2, '2026-06-30', '8:00 PM'),

-- Disclosure Day
(3, '2026-07-01', '2:00 PM'),
(3, '2026-07-01', '8:00 PM'),

-- The Death of Robin Hood
(4, '2026-07-01', '5:00 PM'),
(4, '2026-07-01', '8:00 PM'),

-- Power Ballad
(5, '2026-07-02', '2:00 PM'),
(5, '2026-07-02', '5:00 PM');