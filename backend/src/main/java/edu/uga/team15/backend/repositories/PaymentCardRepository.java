package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.PaymentCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentCardRepository extends JpaRepository<PaymentCard, Long> {

    List<PaymentCard> findByUserIdOrderByCreatedAtAsc(Long userId);

    long countByUserId(Long userId);
}
