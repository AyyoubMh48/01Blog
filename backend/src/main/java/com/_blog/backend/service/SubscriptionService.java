package com._blog.backend.service;

import com._blog.backend.entity.Subscription;
import com._blog.backend.entity.User;
import com._blog.backend.exception.SubscriptionException;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired 
    private UserRepository userRepository;

    

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void followUser(String followerEmail, Long followingId) {
        User follower = userRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new UsernameNotFoundException("User to follow not found"));

        if (follower.getId().equals(following.getId())) {
            throw new SubscriptionException("You cannot follow yourself.");
        }

        if (subscriptionRepository.existsByFollower_IdAndFollowing_Id(follower.getId(), following.getId())) {
            throw new SubscriptionException("You are already following this user.");
        }

        Subscription subscription = new Subscription();
        subscription.setFollower(follower);
        subscription.setFollowing(following);
        subscriptionRepository.save(subscription);

        String message = follower.getOriginalUsername() + " started following you.";
        notificationService.createNotification(follower,following, message, "/block/" + follower.getOriginalUsername());
    }

    @Transactional
    public void unfollowUser(String followerEmail, Long followingId) {
        User follower = userRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new UsernameNotFoundException("User to unfollow not found"));

        Subscription subscription = subscriptionRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new SubscriptionException("You are not following this user."));
        
        subscriptionRepository.delete(subscription);
    }
}