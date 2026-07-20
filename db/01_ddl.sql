-- Cinema E-Booking System - MySQL schema (Team 15)
--
-- Mapped from the Deliverable 3 domain class diagram. The Spring backend
-- manages the same tables through JPA (ddl-auto=update), so this file is the
-- reference schema + what the MySQL container runs on first startup.
-- Movie/admin seed data is inserted by the backend on boot, not here.

-- ---------------------------------------------------------------------
-- movies
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
-- scheduling + booking
-- ---------------------------------------------------------------------

-- seat labels (A1..H12) are derived from rows x seats per row, so there is
-- no separate seats table; tickets store the label directly
CREATE TABLE IF NOT EXISTS showrooms (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(255) NOT NULL,
    seat_rows     INT NOT NULL,
    seats_per_row INT NOT NULL
);

CREATE TABLE IF NOT EXISTS shows (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    movie_id    BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    starts_at   DATETIME NOT NULL,
    FOREIGN KEY (movie_id)    REFERENCES movies(id)    ON DELETE CASCADE,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id) ON DELETE CASCADE,
    -- the scheduling-conflict rule: one show per room per start time
    UNIQUE (showroom_id, starts_at)
);

CREATE TABLE IF NOT EXISTS promotions (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    code             VARCHAR(50) NOT NULL UNIQUE,
    description      VARCHAR(255),
    discount_percent INT NOT NULL,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    show_id    BIGINT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    CONSTRAINT chk_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS tickets (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id  BIGINT NOT NULL,
    seat_label  VARCHAR(5) NOT NULL,          -- e.g. 'C7'
    ticket_type VARCHAR(10) NOT NULL,         -- ADULT / SENIOR / CHILD
    price       DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT chk_ticket_type CHECK (ticket_type IN ('ADULT', 'SENIOR', 'CHILD'))
);
