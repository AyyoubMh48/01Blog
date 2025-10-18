package com._blog.backend.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class GravatarUtil {
    public static String generateUrl(String email) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(email.trim().toLowerCase().getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return "https://www.gravatar.com/avatar/" + sb.toString() + "?d=mp";
        } catch (NoSuchAlgorithmException e) {
            // Fallback to a default in case of error
            return "https://www.gravatar.com/avatar/?d=mp";
        }
    }
}