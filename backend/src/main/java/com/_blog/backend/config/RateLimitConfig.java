package com._blog.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

    @Value("${rate.limit.login.capacity}")
    private int loginCapacity;

    @Value("${rate.limit.login.refill-tokens}")
    private int loginRefillTokens;

    @Value("${rate.limit.login.refill-duration-minutes}")
    private int loginRefillDurationMinutes;

    @Value("${rate.limit.register.capacity}")
    private int registerCapacity;

    @Value("${rate.limit.register.refill-tokens}")
    private int registerRefillTokens;

    @Value("${rate.limit.register.refill-duration-minutes}")
    private int registerRefillDurationMinutes;

    @Value("${rate.limit.post.capacity}")
    private int postCapacity;

    @Value("${rate.limit.post.refill-tokens}")
    private int postRefillTokens;

    @Value("${rate.limit.post.refill-duration-minutes}")
    private int postRefillDurationMinutes;

    @Value("${rate.limit.comment.capacity}")
    private int commentCapacity;

    @Value("${rate.limit.comment.refill-tokens}")
    private int commentRefillTokens;

    @Value("${rate.limit.comment.refill-duration-minutes}")
    private int commentRefillDurationMinutes;

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> postBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> commentBuckets = new ConcurrentHashMap<>();

    public Bucket resolveLoginBucket(String key) {
        return loginBuckets.computeIfAbsent(key, k -> createLoginBucket());
    }

    public Bucket resolveRegisterBucket(String key) {
        return registerBuckets.computeIfAbsent(key, k -> createRegisterBucket());
    }

    public Bucket resolvePostBucket(String key) {
        return postBuckets.computeIfAbsent(key, k -> createPostBucket());
    }

    public Bucket resolveCommentBucket(String key) {
        return commentBuckets.computeIfAbsent(key, k -> createCommentBucket());
    }

    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(
                loginCapacity,
                Refill.intervally(loginRefillTokens, Duration.ofMinutes(loginRefillDurationMinutes))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createRegisterBucket() {
        Bandwidth limit = Bandwidth.classic(
                registerCapacity,
                Refill.intervally(registerRefillTokens, Duration.ofMinutes(registerRefillDurationMinutes))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createPostBucket() {
        Bandwidth limit = Bandwidth.classic(
                postCapacity,
                Refill.intervally(postRefillTokens, Duration.ofMinutes(postRefillDurationMinutes))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createCommentBucket() {
        Bandwidth limit = Bandwidth.classic(
                commentCapacity,
                Refill.intervally(commentRefillTokens, Duration.ofMinutes(commentRefillDurationMinutes))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

 
    public Map<String, Object> checkRateLimit(Bucket bucket, String errorMessage) {
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (!probe.isConsumed()) {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("error", errorMessage);
            response.put("message", "Please try again in " + waitForRefill + " seconds");
            response.put("retryAfter", waitForRefill);
            return response;
        }
        
        return null; 
    }
}
