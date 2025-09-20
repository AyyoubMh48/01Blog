package com._blog.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SubscriptionException extends RuntimeException {
    public SubscriptionException(String message) {
        super(message);
    }
}