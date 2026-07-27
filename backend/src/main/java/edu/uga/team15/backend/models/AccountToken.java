package edu.uga.team15.backend.models;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * One-time tokens sent by email: account activation links and password
 * reset links. Single-use with an expiry.
 */
@Entity
@Table(name = "account_tokens")
public class AccountToken {

    public enum Purpose { ACTIVATION, PASSWORD_RESET }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Purpose purpose;

    @Column(nullable = false)
    private Instant expiresAt;

    private boolean used;

    public AccountToken() {
    }

    public AccountToken(String token, User user, Purpose purpose, Instant expiresAt) {
        this.token = token;
        this.user = user;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public Long getId() { return id; }

    public String getToken() { return token; }

    public User getUser() { return user; }

    public Purpose getPurpose() { return purpose; }

    public Instant getExpiresAt() { return expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
