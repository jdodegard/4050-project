package edu.uga.team15.backend.models;

import jakarta.persistence.*;

/**
 * One physical seat for one specific show - the logical seat/showtime unit
 * the seat map is built from. Generated for every seat in the showroom the
 * moment a show is scheduled, so seat state is a real row instead of
 * something inferred from which tickets happen to exist.
 */
@Entity
@Table(name = "show_seats", uniqueConstraints = @UniqueConstraint(columnNames = {"show_id", "seat_label"}))
public class ShowSeat {

    public enum Status { AVAILABLE, BOOKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "show_id")
    private Show show;

    @Column(name = "seat_label", nullable = false)
    private String seatLabel;   // e.g. "C7"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.AVAILABLE;

    public ShowSeat() {
    }

    public ShowSeat(Show show, String seatLabel) {
        this.show = show;
        this.seatLabel = seatLabel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Show getShow() { return show; }
    public void setShow(Show show) { this.show = show; }

    public String getSeatLabel() { return seatLabel; }
    public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
