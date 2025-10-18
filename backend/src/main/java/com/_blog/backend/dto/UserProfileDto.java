package com._blog.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileDto {
    private Long id;
    private String username;
    private List<PostResponseDto> posts;
    private boolean isFollowedByCurrentUser;
    private String avatarUrl;
    private String bio;
}