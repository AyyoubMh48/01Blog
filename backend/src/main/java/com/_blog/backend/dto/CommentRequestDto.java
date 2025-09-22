package com._blog.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CommentRequestDto {
    @NotEmpty(message = "Comment content cannot be empty.")
    private String content;
}