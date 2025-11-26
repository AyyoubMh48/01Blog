package com._blog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_posts_author_created", columnList = "user_id, createdAt"),
    @Index(name = "idx_posts_status_created", columnList = "status, createdAt"),
    @Index(name = "idx_posts_status", columnList = "status"),
    @Index(name = "idx_posts_created", columnList = "createdAt")
})
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

    @Enumerated(EnumType.STRING) // This stores the enum as a string ("PUBLISHED") in the DB
    @Column(nullable = false)
    private PostStatus status;


    @PrePersist // auto set createdAt  = now() when insert new post
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        this.status = PostStatus.PUBLISHED;
    }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    //  post can have many likes
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Like> likes = new HashSet<>();

    
}