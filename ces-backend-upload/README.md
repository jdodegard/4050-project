# CES Backend — Sprint 1

Spring Boot + JPA backend for the Cinema E-Booking System. Serves movie data
(home, details, search, filter) from a database seeded with 12 movies.

## Run it
```bash
mvn spring-boot:run
```
Then open http://localhost:8080/api/movies — you should see 12 movies.

That's it. No database install needed: it uses an **H2 file database** by default
(data persists in `./data/`). To wipe and re-seed, delete the `data/` folder and restart.

## Quick checks
```bash
curl localhost:8080/api/movies                                # all 12
curl "localhost:8080/api/movies?status=COMING_SOON"           # coming soon
curl localhost:8080/api/movies/1                              # details
curl "localhost:8080/api/movies/search?title=man"            # search
curl "localhost:8080/api/movies/filter?genre=Sci-Fi"         # filter
curl localhost:8080/api/movies/genres                        # genre list
```

Browse the DB visually: http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:file:./data/cesdb`, user `sa`, no password).

## Switching to MySQL
Edit `src/main/resources/application.properties`: comment the H2 block, uncomment
the MySQL block, set your password. Then:
```sql
CREATE DATABASE ces;
```
Restart — the seeder fills the table automatically. The MySQL driver is already included.

## Project layout
```
model/Movie.java            the movies table (entity)
model/MovieStatus.java      CURRENTLY_RUNNING / COMING_SOON
repository/MovieRepository  database queries (auto-implemented by Spring)
service/MovieService        business logic
controller/MovieController  REST endpoints
config/DataSeeder           seeds 12 movies on first startup
```

See **API_CONTRACT.md** for the endpoints the frontend consumes.
