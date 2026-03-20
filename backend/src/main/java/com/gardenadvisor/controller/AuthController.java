package com.gardenadvisor.controller;

import com.gardenadvisor.dto.AuthResponse;
import com.gardenadvisor.dto.LoginRequest;
import com.gardenadvisor.dto.RegisterRequest;
import com.gardenadvisor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    @PutMapping("/language")
    public ResponseEntity<?> updateLanguage(
            @RequestParam String language,
            @RequestAttribute(name = "userEmail", required = false) String email,
            java.security.Principal principal) {
        try {
            String userEmail = principal != null ? principal.getName() : email;
            authService.updateLanguage(userEmail, language);
            return ResponseEntity.ok(Map.of("message", "Language updated successfully", "language", language));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
