package com.aipredict.auth.repository;

import com.aipredict.auth.model.BlackListedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BlackListedTokenRepository extends JpaRepository<BlackListedToken, Long> {
    Optional<BlackListedToken> findByToken(String token);
}
