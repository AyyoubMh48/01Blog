package com._blog.backend.service;

import com._blog.backend.dto.ChangePasswordDto;
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
import org.springframework.security.crypto.password.PasswordEncoder; 

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

    @Autowired
    private PasswordEncoder passwordEncoder; 
    
    @Transactional(readOnly = true) 
    public UserProfileDto getUserProfile(String username, String currentUsername) {
       //  System.out.println("--- [DEBUG] Fetching profile for: " + username);
    //System.out.println("--- [DEBUG] Current logged-in user (email): " + currentUsername);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        User currentUser = (currentUsername != null) ? userRepository.findByEmail(currentUsername).orElse(null) : null;

        boolean isFollowing = false;
        if (currentUser != null) {
          //   System.out.println("--- [DEBUG] Profile User ID: " + user.getId());
          //  System.out.println("--- [DEBUG] Current User (Follower) ID: " + currentUser.getId());
        isFollowing = subscriptionRepository.existsByFollower_IdAndFollowing_Id(currentUser.getId(), user.getId());
                  //  System.out.println("--- [DEBUG] Database check: Is Following? " + isFollowing);
        }

        List<Post> userPosts = postRepository.findAllByAuthor(user);
        
        List<PostResponseDto> postDtos = userPosts.stream()
                .map(post -> postService.mapToDto(post, currentUser))
                .collect(Collectors.toList());

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setId(user.getId());
        profileDto.setUsername(user.getOriginalUsername());
        profileDto.setPosts(postDtos);
        profileDto.setFollowedByCurrentUser(isFollowing);
        
        return profileDto;
    }

    @Transactional
    public void changePassword(String userEmail, ChangePasswordDto changePasswordDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordDto.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));

        userRepository.save(user);
    }
}