package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_recipient_read", columnList = "recipient_id, isRead"),
    @Index(name = "idx_notif_recipient_created", columnList = "recipient_id, createdAt")
})
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient; 

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    private String link; // Optional link to the content (e.g., /posts/123)

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}