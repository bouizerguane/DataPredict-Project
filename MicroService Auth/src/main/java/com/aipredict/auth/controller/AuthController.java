package com.aipredict.auth.controller;

import com.aipredict.auth.model.AuthRequest;
import com.aipredict.auth.model.User;
import com.aipredict.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public String getToken(@RequestBody AuthRequest authRequest) {
        return service.login(authRequest.getEmail(), authRequest.getPassword());
    }

    @GetMapping("/verify")
    public boolean verifyToken(@RequestParam("token") String token) {
        try {
            service.validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @PostMapping("/logout")
    public String logout(@RequestParam("token") String token) {
        service.logout(token);
        return "Logged out successfully";
    }

    @GetMapping("/profile")
    public com.aipredict.auth.model.UserResponse getUserProfile(@RequestParam("token") String token) {
        return service.getUserDetails(token);
    }
}
