package com._blog.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
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

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    public Bucket resolveLoginBucket(String key) {
        return loginBuckets.computeIfAbsent(key, k -> createLoginBucket());
    }

    public Bucket resolveRegisterBucket(String key) {
        return registerBuckets.computeIfAbsent(key, k -> createRegisterBucket());
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
}
