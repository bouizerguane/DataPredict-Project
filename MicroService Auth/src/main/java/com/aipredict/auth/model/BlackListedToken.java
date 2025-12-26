package com.aipredict.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_tokens")
public class BlackListedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    private LocalDateTime invalidatedAt;

    public BlackListedToken() {
    }

    public BlackListedToken(Long id, String token, LocalDateTime invalidatedAt) {
        this.id = id;
        this.token = token;
        this.invalidatedAt = invalidatedAt;
    }

    public BlackListedToken(String token, LocalDateTime invalidatedAt) {
        this.token = token;
        this.invalidatedAt = invalidatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getInvalidatedAt() {
        return invalidatedAt;
    }

    public void setInvalidatedAt(LocalDateTime invalidatedAt) {
        this.invalidatedAt = invalidatedAt;
    }
}
