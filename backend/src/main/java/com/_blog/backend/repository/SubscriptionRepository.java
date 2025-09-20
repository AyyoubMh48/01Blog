package com._blog.backend.repository;

import com._blog.backend.entity.Subscription;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByFollowerAndFollowing(User follower, User following);

    List<Subscription> findAllByFollower(User follower);

    List<Subscription> findAllByFollowing(User following);
}