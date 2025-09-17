package com._blog.backend.dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PostDto {
       @NotEmpty(message = "Post content cannot be empty.")
    private String content;
}