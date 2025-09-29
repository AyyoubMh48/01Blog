package com._blog.backend.controller;

import com._blog.backend.dto.NotificationResponseDto;
import com._blog.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getUserNotifications(Principal principal) {
        List<NotificationResponseDto> notifications = notificationService.getNotificationsForUser(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId, Principal principal) {
        notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Notification marked as read."));
    }
}