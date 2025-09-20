package com._blog.backend.controller;

import com._blog.backend.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long userId, Principal principal) {//@PathVariable captures the user ID from the URL
        subscriptionService.followUser(principal.getName(), userId);
        return ResponseEntity.ok(Map.of("message", "Successfully followed user."));
    }

    @DeleteMapping("/{userId}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long userId, Principal principal) {
        subscriptionService.unfollowUser(principal.getName(), userId);
        return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user."));
    }
}