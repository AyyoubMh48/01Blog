package com._blog.backend.service;

import com._blog.backend.entity.Subscription;
import com._blog.backend.entity.User;
import com._blog.backend.exception.SubscriptionException;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired //no need to create objects manually ->"userRepository = new UserRepositoryImpl();"
    private UserRepository userRepository;

    @Transactional // database transaction - all fine -> commit ,if an exception -> rollback
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