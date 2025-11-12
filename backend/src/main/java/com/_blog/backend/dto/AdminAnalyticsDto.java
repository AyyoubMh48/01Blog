package com._blog.backend.dto;

import lombok.Data;

@Data
public class AdminAnalyticsDto {
    private long totalUsers;
    private long totalPosts;
    private long openReports;
    // We can add a list of most reported users later if needed
}