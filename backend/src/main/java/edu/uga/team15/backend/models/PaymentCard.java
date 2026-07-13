package edu.uga.team15.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * A saved payment card. The full card number is AES-encrypted before it ever
 * touches the database - only the last 4 digits are kept readable so the
 * profile page has something to display.
 */
@Entity
@Table(name = "payment_cards")
public class PaymentCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Visa / Mastercard / Amex / Discover, detected from the number prefix. */
    private String cardType;

    @JsonIgnore
    @Column(nullable = false, length = 512)
    private String cardNumberEnc;

    @Column(nullable = false, length = 4)
    private String last4;

    @Column(nullable = false)
    private int expMonth;

    @Column(nullable = false)
    private int expYear;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public PaymentCard() {
    }

    public PaymentCard(User user, String cardType, String cardNumberEnc, String last4, int expMonth, int expYear) {
        this.user = user;
        this.cardType = cardType;
        this.cardNumberEnc = cardNumberEnc;
        this.last4 = last4;
        this.expMonth = expMonth;
        this.expYear = expYear;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getCardNumberEnc() { return cardNumberEnc; }
    public void setCardNumberEnc(String cardNumberEnc) { this.cardNumberEnc = cardNumberEnc; }

    public String getLast4() { return last4; }
    public void setLast4(String last4) { this.last4 = last4; }

    public int getExpMonth() { return expMonth; }
    public void setExpMonth(int expMonth) { this.expMonth = expMonth; }

    public int getExpYear() { return expYear; }
    public void setExpYear(int expYear) { this.expYear = expYear; }

    public Instant getCreatedAt() { return createdAt; }
}
