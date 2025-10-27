package com._blog.backend.dto;

import lombok.Data;
import java.util.Set;

@Data
public class TrendingPostDto {
    private Long id;
    private String title;
    private Set<TagDto> tags;
}