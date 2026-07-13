package edu.uga.team15.backend.models;

/**
 * Account lifecycle. New accounts start INACTIVE until the user clicks the
 * confirmation link we email them. Admins can suspend accounts later.
 */
public enum UserStatus {
    INACTIVE,
    ACTIVE,
    SUSPENDED
}
