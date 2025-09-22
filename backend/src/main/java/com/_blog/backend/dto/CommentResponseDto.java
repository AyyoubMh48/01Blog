package com._blog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponseDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private AuthorDto author;
}