package com._blog.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminAnalyticsDto {
    private long totalUsers;
    private long totalPosts;
    private long openReports;
    // We can add a list of most reported users later if needed
}