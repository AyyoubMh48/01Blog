package com._blog.backend.controller;

import com._blog.backend.dto.UserProfileDto;
import com._blog.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String username, Principal principal) {
        String currentUsername = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(userService.getUserProfile(username, currentUsername));
    }
}