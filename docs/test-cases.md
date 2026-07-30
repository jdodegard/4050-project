# CES Test Cases (Sprint 3 demo + final demo)

Team 15. These are the execution paths we run for the demo, plus the invalid
inputs we show for validation. Everything assumes a fresh seeded DB (wipe the
H2 file or `docker compose down -v` first, then start the backend).

## Seed data the tests rely on

- Admin: `admin@ces.com` / `admin1234`
- Customer: `joe@cinemabook.com` / `JoePass!123` (active, 3 saved cards)
- Customer: `jane@cinemabook.com` / `JanePass!123` (active, favorites, promo opt-in)
- 12 movies (7 running, 5 coming soon)
- Showrooms: 1 (8x12), 2 (6x10), 3 (5x8)
- 27 showtimes over the next 3 days at 2/5/8 PM, every room filled each slot
- Pre-booked seats: C4, C5, C6 on the first show, A1, A2 on the second

## 1. Browsing (Sprint 1 regression)

| # | Steps | Expected |
|---|-------|----------|
| 1.1 | Open home page | Now Playing and Coming Soon sections load from DB |
| 1.2 | Search "dark" | The Dark Knight comes back, partial + case-insensitive |
| 1.3 | Search "zzzz" | No-results message, no crash |
| 1.4 | Filter genre = Sci-Fi | Only Sci-Fi movies shown |
| 1.5 | Open a movie | Poster, badges, description, trailer plays |

## 2. Accounts (Sprint 2 regression)

| # | Steps | Expected |
|---|-------|----------|
| 2.1 | Register a new account | Created INACTIVE, confirmation email sent (console if no SMTP) |
| 2.2 | Log in before confirming | Blocked with "confirm your email" message |
| 2.3 | Click emailed link, then log in | Activates, login works, lands on home |
| 2.4 | Log in as admin | Redirected to the admin portal |
| 2.5 | Wrong password | "Invalid email or password", no hint which was wrong |
| 2.6 | Edit profile / add 4th card | Email field locked; 4th card rejected |

## 3. Admin: add movie

| # | Steps | Expected |
|---|-------|----------|
| 3.1 | Admin portal > Manage Movies, fill title/genre/rating/status, save | Success banner with a link, movie appears in the catalog table |
| 3.2 | Open the user site after 3.1 | New movie shows on home + detail page (integration check) |
| 3.3 | Submit with empty title | "Title is required.", nothing saved |
| 3.4 | Submit with no rating picked | "Pick an MPAA rating.", nothing saved |
| 3.5 | POST /api/admin/movies while signed out (curl) | 401, server-side gate holds without the UI |
| 3.6 | Same POST signed in as a customer | 403 Admins only |

## 4. Admin: schedule showtimes

| # | Steps | Expected |
|---|-------|----------|
| 4.1 | Manage Showtimes: pick movie, Showroom 1, future date, free time | Saved, schedule table refreshes, success message |
| 4.2 | Open that movie in the user portal | The new showtime is listed under the right day (integration check) |
| 4.3 | Schedule the SAME room + same time again (any movie) | Rejected: "Showroom X already has a show at that time." |
| 4.4 | Same time, different room | Accepted, conflicts are per-room |
| 4.5 | Date in the past | Rejected: "Showtime must be in the future." |
| 4.6 | Submit with no movie/room picked | Client-side error, nothing sent |
| 4.7 | Showroom dropdown | Shows all 3 rooms with seat counts, proves 3+ rooms seeded |

## 5. User booking flow

Run as one continuous path: movie > showtime > tickets > seat map.

| # | Steps | Expected |
|---|-------|----------|
| 5.1 | Movie page for the first seeded show | Showtimes grouped by day, each with time + room |
| 5.2 | Pick a showtime | Booking page shows movie, date/time, room chips |
| 5.3 | Add 2 adult + 1 child | Order summary: each type priced separately, fee + tax + total update live |
| 5.4 | Look at the seat map (first show) | Room 1's 8x12 grid, C4/C5/C6 greyed out as booked |
| 5.5 | Click a booked seat | Nothing happens, it's disabled |
| 5.6 | Try to pick a 4th seat with 3 tickets | Blocked, selection capped at ticket count |
| 5.7 | Drop a ticket after picking 3 seats | Extra seat auto-deselected |
| 5.8 | Pick exactly 3 free seats | Checkout button enables, seats listed in the summary |
| 5.9 | 0 tickets | Seat map disabled, "add tickets" hint |
| 5.10 | Increase any combination of child/adult/senior tickets to the number of available seats | All ticket `+` buttons disable at the combined limit; another ticket cannot be added |

## 6. Login gate at checkout

| # | Steps | Expected |
|---|-------|----------|
| 6.1 | Do 5.1-5.8 signed OUT, hit Proceed to Checkout | Sent to the login page |
| 6.2 | Sign in as joe | Land back on checkout, same seats still selected |

## 7. Checkout + mock payment

The Sprint 3 rubric only requires the payment-page mockup. The accepted/declined
mock-payment paths and final seat confirmation are implemented beyond that scope.

| # | Steps | Expected |
|---|-------|----------|
| 7.1 | Checkout page | Movie, showtime, seats, per-ticket prices, total before tax, then tax + total |
| 7.2 | Email step | Account email preselected, can switch to a typed email |
| 7.3 | Type "notanemail" as the other email | "Enter a valid email address.", stays on the page |
| 7.4 | Continue with a valid confirmation email | Payment page opens with required card fields and the correct order total |
| 7.5 | Submit `4242 4242 4242 4242`, any name, a future `MM/YY`, and a 3- or 4-digit CVV | Payment accepted; confirmation shows booking number, payment reference, and selected seats |
| 7.6 | Reload the same show's seat map after 7.5 | Purchased seats are unavailable |
| 7.7 | Submit `4000 0000 0000 0002` with otherwise valid fields | Mock payment is declined; no booking is created and the booking draft remains |
| 7.8 | Submit a malformed card number, expired date, or invalid CVV | Helpful validation error; no booking is created |
| 7.9 | Have two sessions select the same seat, then pay in the first followed by the second | First succeeds; second receives a seat-unavailable message and can return to choose another seat |

## 8. Promotions (bonus)

| # | Steps | Expected |
|---|-------|----------|
| 8.1 | Manage Promotions: code + 25% + valid dates | Created, "Emailed 1 subscriber" (jane opted in, joe didn't) |
| 8.2 | Reuse the same code | Rejected, codes are unique |
| 8.3 | Discount = 0 or 150 | Rejected, must be 1-100 |
| 8.4 | End date before start date | Rejected |

## Notes for the demo

- The whole thing is one flow: add a movie as admin, schedule it into a room,
  then book it as a user and watch the taken seats show up.
- Critical inputs are validated by the server. The DDL additionally enforces
  constraints such as unique showroom/start time, unique promotion codes, and
  valid enum-like status/type values.
- Seat selections are retained in `sessionStorage` through login, but they are
  not pre-payment server reservations. At payment time the backend locks the
  show, rechecks availability, and writes the booking and tickets atomically.
  Therefore there is currently no temporary hold that needs a 5-minute unlock.
