package com.todo.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置类
 *
 * 注意：CORS 配置已移至 WebSecurityConfig 类中，
 * 通过 Spring Security 的 CorsConfigurationSource 统一管理。
 * 这样可以确保 CORS 配置在安全过滤器链中正确应用。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration is now handled by WebSecurityConfig
    // through Spring Security's CorsConfigurationSource
}
