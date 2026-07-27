package edu.uga.team15.backend.models;

/**
 * Determines which portal a user lands on after login.
 * Admins are seeded/promoted manually, registration always creates customers.
 */
public enum Role {
    CUSTOMER,
    ADMIN
}
