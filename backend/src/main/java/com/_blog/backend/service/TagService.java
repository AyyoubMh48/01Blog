package com._blog.backend.service;

import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.TagDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.PostStatus;
import com._blog.backend.entity.User;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.TagRepository;
import com._blog.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PostService postService;

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPostsByTag(String tagName, String currentUserEmail, Pageable pageable) {
        User currentUser = (currentUserEmail != null) ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
    Page<Post> postPage = postRepository.findByTags_NameIgnoreCaseAndStatusOrderByCreatedAtDesc(tagName, PostStatus.PUBLISHED, pageable);
        return postPage.map(post -> postService.mapToDto(post, currentUser));
    }

    @Transactional(readOnly = true)
    public List<TagDto> getPopularTags(int limit) {
        return tagRepository.findPopularTags(limit).stream()
                .map(tag -> {
                    TagDto dto = new TagDto();
                    dto.setId(tag.getId());
                    dto.setName(tag.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}