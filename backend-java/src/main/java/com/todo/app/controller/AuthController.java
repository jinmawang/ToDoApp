package com.todo.app.controller;

import com.todo.app.dto.LoginDTO;
import com.todo.app.dto.RegisterDTO;
import com.todo.app.dto.TokenDTO;
import com.todo.app.dto.UserResponseDTO;
import com.todo.app.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        UserResponseDTO user = authService.register(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        TokenDTO token = authService.login(loginDTO);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponseDTO user = authService.getProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(
            Authentication authentication,
            @RequestBody RegisterDTO updateData) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponseDTO user = authService.updateProfile(userId, updateData);
        return ResponseEntity.ok(user);
    }
}
