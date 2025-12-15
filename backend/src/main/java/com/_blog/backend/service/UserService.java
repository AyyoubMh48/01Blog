package com._blog.backend.service;

import com._blog.backend.dto.ChangePasswordDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.ProfileUpdateRequestDto;
import com._blog.backend.dto.UserProfileDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.PostStatus;
import com._blog.backend.entity.User;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
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

    @Autowired
    private FileStorageService fileStorageService;
    
    @Transactional(readOnly = true) 
    public UserProfileDto getUserProfile(String username, String currentUsername) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        User currentUser = (currentUsername != null) ? userRepository.findByEmail(currentUsername).orElse(null) : null;

        boolean isFollowing = false;
        if (currentUser != null) {
        isFollowing = subscriptionRepository.existsByFollower_IdAndFollowing_Id(currentUser.getId(), user.getId());
                  //  System.out.println("--- [DEBUG] Database check: Is Following? " + isFollowing);
        }

        // Get user posts ordered by newest first
        List<Post> userPosts = postRepository.findAllByAuthorOrderByCreatedAtDesc(user);
        
        List<PostResponseDto> postDtos = userPosts.stream()
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED) 
                .map(post -> postService.mapToDto(post, currentUser))
                .collect(Collectors.toList());

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setId(user.getId());
        profileDto.setUsername(user.getOriginalUsername());
        profileDto.setPosts(postDtos);
        profileDto.setFollowedByCurrentUser(isFollowing);

        profileDto.setAvatarUrl(user.getAvatarUrl());
        profileDto.setBio(user.getBio());
        
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

    @Transactional
    public void updateProfile(String userEmail, ProfileUpdateRequestDto profileDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setBio(profileDto.getBio());
        userRepository.save(user);
    }

    @Transactional
    public String updateAvatar(String userEmail, MultipartFile file) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String avatarUrl = fileStorageService.storeFile(file, userEmail);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return avatarUrl;
    }
}