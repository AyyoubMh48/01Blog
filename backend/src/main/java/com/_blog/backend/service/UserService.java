package com._blog.backend.service;

import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.UserProfileDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Transactional(readOnly = true) 
    public UserProfileDto getUserProfile(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean isFollowing = false;
        if (currentUsername != null) {
            User currentUser = userRepository.findByEmail(currentUsername).orElse(null);
            if (currentUser != null) {
                isFollowing = subscriptionRepository.findByFollowerAndFollowing(currentUser, user).isPresent();
            }
        }
        
        List<Post> userPosts = postRepository.findAllByAuthor(user);
        
        List<PostResponseDto> postDtos = userPosts.stream().map(post -> {
            PostResponseDto dto = new PostResponseDto();
            dto.setId(post.getId());
            dto.setContent(post.getContent());
            dto.setCreatedAt(post.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setId(user.getId());
        profileDto.setUsername(user.getUsername());
        profileDto.setPosts(postDtos);
        profileDto.setFollowedByCurrentUser(isFollowing);
        
        return profileDto;
    }
}