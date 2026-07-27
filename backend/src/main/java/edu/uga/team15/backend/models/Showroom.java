package edu.uga.team15.backend.models;

import jakarta.persistence.*;

/**
 * A screening room. The seat layout is just rows x seats per row, and the
 * seat labels ("A1", "B7"...) are derived from it on the fly.
 */
@Entity
@Table(name = "showrooms")
public class Showroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int seatRows;

    @Column(nullable = false)
    private int seatsPerRow;

    public Showroom() {
    }

    public Showroom(String name, int seatRows, int seatsPerRow) {
        this.name = name;
        this.seatRows = seatRows;
        this.seatsPerRow = seatsPerRow;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getSeatRows() { return seatRows; }
    public void setSeatRows(int seatRows) { this.seatRows = seatRows; }

    public int getSeatsPerRow() { return seatsPerRow; }
    public void setSeatsPerRow(int seatsPerRow) { this.seatsPerRow = seatsPerRow; }

    public int getCapacity() { return seatRows * seatsPerRow; }
}
