package com._blog.backend.service;

import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.PostDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public PostResponseDto createPost(PostDto postDto, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authorEmail));

        Post newPost = new Post();
        newPost.setContent(postDto.getContent());
        newPost.setAuthor(author);


        Post savedPost = postRepository.save(newPost);
        return mapToDto(savedPost);
    }
    

    public List<PostResponseDto> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::mapToDto) 
                .toList();
    }
     private PostResponseDto mapToDto(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());

        AuthorDto authorDto = new AuthorDto();
        authorDto.setId(post.getAuthor().getId());
        authorDto.setUsername(post.getAuthor().getUsername());
        
        dto.setAuthor(authorDto);
        return dto;
    }
}