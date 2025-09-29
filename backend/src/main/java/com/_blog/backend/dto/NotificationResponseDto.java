package com._blog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDto {
    private Long id;
    private String message;
    private boolean isRead;
    private String link;
    private LocalDateTime createdAt;
}