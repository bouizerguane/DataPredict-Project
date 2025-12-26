package com.aipredict.auth.service;

import com.aipredict.auth.model.User;
import com.aipredict.auth.model.BlackListedToken;
import com.aipredict.auth.repository.BlackListedTokenRepository;
import com.aipredict.auth.repository.UserRepository;
import com.aipredict.auth.util.JwtUtil;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private BlackListedTokenRepository blackListedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    public String saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.save(user);
        return "User added to the system";
    }

    public String login(String email, String password) {
        Authentication authenticate = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(email, password));
        if (authenticate.isAuthenticated()) {
            return jwtService.generateToken(email);
        } else {
            throw new RuntimeException("invalid access");
        }
    }

    public void validateToken(String token) {
        if (blackListedTokenRepository.findByToken(token).isPresent()) {
            throw new RuntimeException("Token has been invalidated (Logged out)");
        }
        String username = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtService.validateToken(token, userDetails)) {
            throw new RuntimeException("Invalid Token");
        }
    }

    public void logout(String token) {
        if (blackListedTokenRepository.findByToken(token).isEmpty()) {
            blackListedTokenRepository.save(new BlackListedToken(token, LocalDateTime.now()));
        }
    }

    public com.aipredict.auth.model.UserResponse getUserDetails(String token) {
        validateToken(token);
        String username = jwtService.extractUsername(token);
        User user = repository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new com.aipredict.auth.model.UserResponse(user.getId(), user.getNom(), user.getPrenom(),
                user.getEmail());
    }
}
