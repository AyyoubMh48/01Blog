package com._blog.backend.controller;

import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.TagDto;
import com._blog.backend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping("/popular")
    public ResponseEntity<List<TagDto>> getPopularTags(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(tagService.getPopularTags(limit));
    }

    @GetMapping("/{tagName}/posts")
    public ResponseEntity<Page<PostResponseDto>> getPostsByTag(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String currentUserEmail = (principal != null) ? principal.getName() : null;
        Page<PostResponseDto> postPage = tagService.getPostsByTag(tagName, currentUserEmail, pageable);
        return ResponseEntity.ok(postPage);
    }

}