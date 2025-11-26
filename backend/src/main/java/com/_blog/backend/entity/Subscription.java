package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subscriptions", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "following_id"})
    },
    indexes = {
        @Index(name = "idx_sub_follower", columnList = "follower_id"),
        @Index(name = "idx_sub_following", columnList = "following_id")
    }
)
@Getter
@Setter
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower; //  user who is doing the following

    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private User following; //  user who is being followed
}