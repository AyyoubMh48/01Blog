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

    @Autowired
    private PostService postService; 
    
    @Transactional(readOnly = true) 
    public UserProfileDto getUserProfile(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        User currentUser = (currentUsername != null) ? userRepository.findByEmail(currentUsername).orElse(null) : null;

        boolean isFollowing = (currentUser != null) && subscriptionRepository.findByFollowerAndFollowing(currentUser, user).isPresent();
        
        List<Post> userPosts = postRepository.findAllByAuthor(user);
        
        List<PostResponseDto> postDtos = userPosts.stream()
                .map(post -> postService.mapToDto(post, currentUser))
                .collect(Collectors.toList());

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setId(user.getId());
        profileDto.setUsername(user.getUsername());
        profileDto.setPosts(postDtos);
        profileDto.setFollowedByCurrentUser(isFollowing);
        
        return profileDto;
    }
}