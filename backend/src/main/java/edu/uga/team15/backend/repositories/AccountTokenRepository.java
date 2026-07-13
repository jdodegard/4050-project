package edu.uga.team15.backend.repositories;

import edu.uga.team15.backend.models.AccountToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountTokenRepository extends JpaRepository<AccountToken, Long> {

    Optional<AccountToken> findByTokenAndPurpose(String token, AccountToken.Purpose purpose);
}
