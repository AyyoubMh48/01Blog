package com._blog.backend.controller;

import com._blog.backend.dto.RegisterDto;
import com._blog.backend.entity.User;
import com._blog.backend.service.AuthService;
import com._blog.backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap; 
import com._blog.backend.dto.LoginDto;
import com._blog.backend.dto.JwtResponse;
import jakarta.validation.Valid;
// import org.springframework.web.bind.annotation.CrossOrigin;

@RestController //It means methods here return JSON responses (not HTML pages)
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RateLimitConfig rateLimitConfig;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDto registerDto, HttpServletRequest request) {
        String clientIp = getClientIP(request);
        
        // Check rate limit
        Bucket bucket = rateLimitConfig.resolveRegisterBucket(clientIp);
        Map<String, Object> rateLimitError = rateLimitConfig.checkRateLimit(bucket, "Too many registration attempts");
        if (rateLimitError != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(rateLimitError);
        }

        User newUser = new User();
        newUser.setUsername(registerDto.getUsername());
        newUser.setEmail(registerDto.getEmail());
        newUser.setPassword(registerDto.getPassword());

        authService.registerUser(newUser);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDto loginDto, HttpServletRequest request) {
        String clientIp = getClientIP(request);
        
        // Check rate limit
        Bucket bucket = rateLimitConfig.resolveLoginBucket(clientIp);
        Map<String, Object> rateLimitError = rateLimitConfig.checkRateLimit(bucket, "Too many login attempts");
        if (rateLimitError != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(rateLimitError);
        }

        String token = authService.login(loginDto);
        return ResponseEntity.ok(new JwtResponse(token));
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}