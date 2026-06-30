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

## Sprint 1 Features

- Home page with Now Playing / Coming Soon sections (pulled from DB)
- Movie Details page with trailer, showtimes, poster
- Search by title
- Filter by genre
- Booking page prototype (seat map, ticket selection, order summary)
