package com._blog.backend.service;

import com._blog.backend.dto.LoginDto;
import com._blog.backend.entity.User;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager; 

    @Autowired
    private JwtService jwtService;

    @Value("${app.default-avatar-url}") 
    private String defaultAvatarUrl;

    public void registerUser(User user) {
        String lowerCaseUsername = user.getUsername().toLowerCase();
        if (userRepository.findByUsername(lowerCaseUsername).isPresent()) {
            throw new RuntimeException("Username '" + lowerCaseUsername + "' is already taken.");
        }

        String lowerCaseEmail = user.getEmail().toLowerCase();
        if (userRepository.findByEmail(lowerCaseEmail).isPresent()) {
            throw new RuntimeException("Email '" + lowerCaseEmail + "' is already registered.");
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        user.setAvatarUrl(defaultAvatarUrl);

        user.setRole("ROLE_USER");

        userRepository.save(user);
    }

    public String login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );
        //UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = (User) authentication.getPrincipal();

        return jwtService.generateToken(user);
    }
}