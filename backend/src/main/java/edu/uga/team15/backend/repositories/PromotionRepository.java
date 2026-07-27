package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    boolean existsByCodeIgnoreCase(String code);
}
