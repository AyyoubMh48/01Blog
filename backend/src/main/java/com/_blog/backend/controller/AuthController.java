package com._blog.backend.controller;

import com._blog.backend.dto.RegisterDto;
import com._blog.backend.entity.User;
import com._blog.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap; 
// import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterDto registerDto) {
        User newUser = new User();
        newUser.setUsername(registerDto.getUsername());
        newUser.setEmail(registerDto.getEmail());
        newUser.setPassword(registerDto.getPassword());

        authService.registerUser(newUser);

         Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");

        return ResponseEntity.ok(response);
    }
}