package com._blog.backend.dto;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PostDto {
    @Column(nullable = false)
    private String title;
    @NotEmpty(message = "Post content cannot be empty.")
    private String content;
}