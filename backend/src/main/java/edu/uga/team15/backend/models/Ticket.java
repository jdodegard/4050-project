package edu.uga.team15.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/** One seat on a booking, priced by ticket type (adult/child/senior). */
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    @Column(nullable = false)
    private String seatLabel;    // e.g. "C7"

    @Column(nullable = false)
    private String ticketType;   // ADULT / CHILD / SENIOR

    @Column(nullable = false)
    private double price;

    public Ticket() {
    }

    public Ticket(String seatLabel, String ticketType, double price) {
        this.seatLabel = seatLabel;
        this.ticketType = ticketType;
        this.price = price;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public String getSeatLabel() { return seatLabel; }
    public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }

    public String getTicketType() { return ticketType; }
    public void setTicketType(String ticketType) { this.ticketType = ticketType; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
