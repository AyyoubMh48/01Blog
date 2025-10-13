package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@Setter
public class Post {

    private String mediaUrl;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob // large object , for storing long text, not just 255 char
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;
    // many posts belong to one user
    @ManyToOne(fetch = FetchType.LAZY)  // "lazy" mane :when load post ,hibernate will not load user(author) immediately
    // the posts table will have column user_id points to users.id 
    @JoinColumn(name = "user_id", nullable = false) // create user_id and store if of the user who create the post
    private User author;

    @PrePersist // auto set createdAt  = now() when insert new post
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}