package com._blog.backend.service;

import com._blog.backend.entity.Notification;
import com._blog.backend.entity.User;
import com._blog.backend.repository.NotificationRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com._blog.backend.dto.NotificationResponseDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;

    // This method will be called by other services
    public void createNotification(User recipient, String message, String link) {
        // Avoid notifying a user about their own actions
        if (recipient.getEmail().equals(link)) { // A simple check if the link is the user's own profile for a follow
             return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setLink(link);
        Notification savedNotification = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
            recipient.getEmail(), 
            "/queue/notifications", 
            mapToDto(savedNotification)
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto) 
                .toList();
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security check: ensure the user owns the notification
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new SecurityException("User does not have permission to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

     private NotificationResponseDto mapToDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setLink(notification.getLink());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}