package edu.uga.team15.backend.services;

import edu.uga.team15.backend.models.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the system emails: account confirmation, password reset, and the
 * "your profile was changed" notifications.
 *
 * If MAIL_USERNAME / MAIL_PASSWORD are not set, emails are printed to the
 * console instead so the flows are still testable without SMTP credentials.
 */
@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(ObjectProvider<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    public void sendActivationEmail(User user, String token) {
        String link = frontendUrl + "/activate?token=" + token;
        send(user.getEmail(), "Confirm your CES account",
                "Hi " + user.getFirstName() + ",\n\n"
                + "Thanks for registering with the Cinema E-Booking System. "
                + "Click the link below to confirm your email and activate your account:\n\n"
                + link + "\n\n"
                + "The link expires in 24 hours. If you didn't create this account you can ignore this email.");
    }

    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        send(user.getEmail(), "Reset your CES password",
                "Hi " + user.getFirstName() + ",\n\n"
                + "We received a request to reset your password. Click the link below to choose a new one:\n\n"
                + link + "\n\n"
                + "The link expires in 1 hour. If you didn't request this, you can safely ignore this email.");
    }

    /** Sent whenever profile info, password, address or cards change. */
    public void sendAccountNotice(User user, String whatChanged) {
        send(user.getEmail(), "Your CES account was updated",
                "Hi " + user.getFirstName() + ",\n\n"
                + whatChanged + "\n\n"
                + "If this wasn't you, please reset your password right away.");
    }

    private void send(String to, String subject, String body) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || mailUsername == null || mailUsername.isBlank()) {
            // no SMTP credentials configured - log instead of failing
            System.out.println("---- email (SMTP not configured) ----");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println(body);
            System.out.println("-------------------------------------");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(mailUsername);
        message.setSubject(subject);
        message.setText(body);
        sender.send(message);
    }
}
