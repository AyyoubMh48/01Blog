package com._blog.backend.controller;

import com._blog.backend.dto.UserProfileDto;
import com._blog.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map; 

import com._blog.backend.dto.ChangePasswordDto;
import com._blog.backend.dto.ProfileUpdateRequestDto;

import jakarta.validation.Valid;

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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordDto changePasswordDto,
            Principal principal) {
        
        userService.changePassword(principal.getName(), changePasswordDto);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequestDto profileDto, Principal principal) {
        userService.updateProfile(principal.getName(), profileDto);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<?> updateAvatar(@RequestParam("file") MultipartFile file, Principal principal) {
        String newAvatarUrl = userService.updateAvatar(principal.getName(), file);
        return ResponseEntity.ok(Map.of("url", newAvatarUrl));
    }
}