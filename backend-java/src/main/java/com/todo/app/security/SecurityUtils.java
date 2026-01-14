package com.todo.app.security;

import org.springframework.security.core.Authentication;

public class SecurityUtils {

    public static Long getCurrentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        return null;
    }
}
