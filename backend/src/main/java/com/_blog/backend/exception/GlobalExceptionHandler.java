package com._blog.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.HashMap;

@ControllerAdvice //This class will handle exceptions globally for all controllers. Instead of writing try/catch in every controller
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());

        // Return a 400 Bad Request status for user-related errors
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}