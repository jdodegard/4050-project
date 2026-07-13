-- Cinema E-Booking System - MySQL schema (Team 15)
--
-- Mapped from the Deliverable 3 domain class diagram. The Spring backend
-- manages the same tables through JPA (ddl-auto=update), so this file is the
-- reference schema + what the MySQL container runs on first startup.
-- Movie/admin seed data is inserted by the backend on boot, not here.

-- ---------------------------------------------------------------------
-- movies + hardcoded showtimes (booking/scheduling tables come later)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS movies (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    title         VARCHAR(255) NOT NULL,
    genre         VARCHAR(100),
    rating        VARCHAR(10),                -- MPAA: G, PG, PG-13, R...
    description   VARCHAR(2000),
    poster_url    VARCHAR(500),
    trailer_url   VARCHAR(500),
    status        VARCHAR(30) NOT NULL,       -- CURRENTLY_RUNNING / COMING_SOON
    CONSTRAINT chk_movie_status CHECK (status IN ('CURRENTLY_RUNNING', 'COMING_SOON'))
);

CREATE TABLE IF NOT EXISTS movie_showtimes (
    movie_id  BIGINT NOT NULL,
    showtime  VARCHAR(20),                    -- e.g. '2:00 PM'
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name    VARCHAR(255) NOT NULL,
    last_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,      -- BCrypt, never plaintext
    phone         VARCHAR(30),
    role          VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    status        VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    promo_opt_in  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role   CHECK (role IN ('CUSTOMER', 'ADMIN')),
    CONSTRAINT chk_user_status CHECK (status IN ('INACTIVE', 'ACTIVE', 'SUSPENDED'))
);

-- one address per user, enforced by the UNIQUE user_id
CREATE TABLE IF NOT EXISTS addresses (
    id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id  BIGINT NOT NULL UNIQUE,
    street   VARCHAR(255) NOT NULL,
    city     VARCHAR(100) NOT NULL,
    state    VARCHAR(50)  NOT NULL,
    zip      VARCHAR(20)  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- card numbers are AES-encrypted by the backend before insert;
-- the 3-cards-per-user max is enforced in the service layer
CREATE TABLE IF NOT EXISTS payment_cards (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    card_type       VARCHAR(20),              -- Visa / Mastercard / Amex / Discover
    card_number_enc VARCHAR(512) NOT NULL,
    last4           VARCHAR(4) NOT NULL,
    exp_month       INT NOT NULL,
    exp_year        INT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- single-use email tokens (account confirmation, password reset)
CREATE TABLE IF NOT EXISTS account_tokens (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    token      VARCHAR(64) NOT NULL UNIQUE,
    user_id    BIGINT NOT NULL,
    purpose    VARCHAR(20) NOT NULL,          -- ACTIVATION / PASSWORD_RESET
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- user <-> movie many-to-many for the favorites list
CREATE TABLE IF NOT EXISTS favorites (
    user_id  BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- scheduling + booking (from the class diagram; used by the booking sprint)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS theatres (
    id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(255) NOT NULL,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS showrooms (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    theatre_id  BIGINT NOT NULL,
    room_number INT NOT NULL,
    seat_count  INT NOT NULL,
    FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seats (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    showroom_id BIGINT NOT NULL,
    row_label   VARCHAR(5) NOT NULL,          -- A, B, C...
    seat_number INT NOT NULL,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id) ON DELETE CASCADE,
    UNIQUE (showroom_id, row_label, seat_number)
);

CREATE TABLE IF NOT EXISTS shows (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    movie_id     BIGINT NOT NULL,
    showroom_id  BIGINT NOT NULL,
    show_date    DATE NOT NULL,
    show_time    TIME NOT NULL,
    duration_min INT,
    FOREIGN KEY (movie_id)    REFERENCES movies(id)    ON DELETE CASCADE,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS promotions (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    promo_code       VARCHAR(50) NOT NULL UNIQUE,
    description      VARCHAR(500),
    discount_percent DECIMAL(5,2) NOT NULL,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    show_id         BIGINT NOT NULL,
    booking_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal        DECIMAL(8,2) NOT NULL DEFAULT 0,
    fees            DECIMAL(8,2) NOT NULL DEFAULT 0,
    total           DECIMAL(8,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    promotion_id    BIGINT,
    payment_card_id BIGINT,
    FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
    FOREIGN KEY (show_id)         REFERENCES shows(id)         ON DELETE CASCADE,
    FOREIGN KEY (promotion_id)    REFERENCES promotions(id)    ON DELETE SET NULL,
    FOREIGN KEY (payment_card_id) REFERENCES payment_cards(id) ON DELETE SET NULL,
    CONSTRAINT chk_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS tickets (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id  BIGINT NOT NULL,
    seat_id     BIGINT NOT NULL,
    ticket_type VARCHAR(10) NOT NULL,         -- ADULT / SENIOR / CHILD
    price       DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id)    REFERENCES seats(id),
    CONSTRAINT chk_ticket_type CHECK (ticket_type IN ('ADULT', 'SENIOR', 'CHILD'))
);
