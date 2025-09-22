package com._blog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostResponseDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private AuthorDto author;
    private String mediaUrl;
    private long likeCount; 
    private boolean likedByCurrentUser;
}