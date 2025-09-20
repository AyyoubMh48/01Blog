package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subscriptions", uniqueConstraints = { //user can't following the same person more than once.
    @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
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