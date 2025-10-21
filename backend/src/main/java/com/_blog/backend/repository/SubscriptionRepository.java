package com._blog.backend.repository;

import com._blog.backend.entity.Subscription;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

   Optional<Subscription> findByFollowerAndFollowing(User follower, User following);

    boolean existsByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    List<Subscription> findAllByFollower(User follower);

    List<Subscription> findAllByFollowing(User following);

    @Modifying
    @Query("DELETE FROM Subscription s WHERE s.follower = :user OR s.following = :user")
    void deleteAllByUser(@Param("user") User user);
}