# CES Frontend — Cinema E-Booking System

React + Vite frontend for the Cinema E-Booking System (CSCI 4050/6050, Team 15).

## Tech Stack

- React 19 + Vite 8
- React Router v7
- TMDB API (movie posters)

## Getting Started

- Look at ./frontend/README.md for frontend-related config steps

- Have Docker Desktop installed, and have the Docker Engine running
- Run the following commands to run the application (from the root directory):

    - docker compose up --build
        - ^^This will build backend/frontend/db

    - docker compose up --build frontend
        - ^^This will build frontend

    - docker compose up --build backend
        - ^^This will build backend

    - docker compose up --build mysql
        - ^^This will build db
        
- Ctrl + c to end the application, or go to a different terminal in the root directory and run:
    - docker compose down
        - Add the -v flag if you want to wipe the db volume and start from scratch

## Running without Docker (local dev)

Backend (uses a file-based H2 db instead of the MySQL container):

    cd backend
    SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

Frontend:

    cd frontend
    npm install
    npm run dev

Frontend runs on http://localhost:3000, backend on http://localhost:8080.

## Accounts

- The backend seeds an admin on first boot: `admin@ces.com` / `admin1234`
  (admins get redirected to the admin portal after login)
- Customer accounts are created through the registration page and start
  INACTIVE until the emailed confirmation link is clicked

## Emails

Confirmation links, password resets and account-change notices go out over
SMTP when these env vars are set on the backend:

After running docker compose up, go to localhost:8025 to check mail traffic

    MAIL_USERNAME=yourgmail@gmail.com
    MAIL_PASSWORD=your-gmail-app-password

Without them, emails are printed to the backend console instead - the links
still work, just copy them out of the log.

## Sprint 1 Features

- Home page with Now Playing / Coming Soon sections (pulled from DB)
- Movie Details page with trailer, showtimes, poster
- Search by title
- Filter by genre
- Booking page prototype (seat map, ticket selection, order summary)

## Sprint 2 Features

- Registration with email confirmation (accounts start inactive), optional
  address + payment card, promo opt-in
- Login/logout with sessions, role-based redirect (admin portal vs home),
  proper error messages for wrong creds / unconfirmed / suspended accounts
- Forgot password + reset password through emailed one-time links
- Change password (requires the current password)
- Edit profile: personal info (email locked), one saved address, up to 3
  payment cards (AES-encrypted, only last 4 shown), favorites list
- Favorite movies via the heart on any movie card or the details page
- Passwords hashed with BCrypt; email notification on every account change
- Admin portal home page (prototype menu: movies, showtimes, promotions, users)
