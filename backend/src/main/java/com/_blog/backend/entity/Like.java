package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "post_likes", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "post_id"})
    },
    indexes = {
        @Index(name = "idx_likes_post", columnList = "post_id"),
        @Index(name = "idx_likes_user", columnList = "user_id")
    }
)
@Getter
@Setter
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user who gave the like

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post; // The post that was liked
}