package com.todo.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT 认证过滤器
 *
 * 作用：在请求到达控制器之前，拦截并验证 JWT token
 *
 * 工作流程：
 * 1. 每个 HTTP 请求都会经过这个过滤器
 * 2. 从请求头中提取 Authorization 字段
 * 3. 检查是否为 Bearer token 格式
 * 4. 验证 token 的有效性
 * 5. 从 token 中提取用户 ID
 * 6. 将用户 ID 设置到 Spring Security 上下文中
 * 7. 后续代码可以通过 SecurityContextHolder 获取当前用户 ID
 *
 * 关键概念：
 * - Filter（过滤器）：Spring Web 中的拦截器，可以在请求处理前后执行逻辑
 * - OncePerRequestFilter：确保每个请求只过滤一次（推荐继承此类）
 * - SecurityContext：Spring Security 的上下文，存储认证信息
 * - Authentication：认证对象，包含用户信息（principal）、凭证（credentials）、权限（authorities）
 *
 * 使用场景：
 * - 保护需要登录才能访问的 API
 * - 在控制器中获取当前登录用户的 ID
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    /**
     * 构造函数注入 JwtUtil
     * Spring 自动注入依赖
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * 过滤器的核心方法
     *
     * @param request  HTTP 请求对象
     * @param response HTTP 响应对象
     * @param filterChain 过滤器链（包含其他过滤器）
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. 从请求头中获取 Authorization 字段
        // 格式：Authorization: Bearer <token>
        String authHeader = request.getHeader("Authorization");

        // 2. 检查请求头是否存在，且以 "Bearer " 开头
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // 3. 提取 token（去掉 "Bearer " 前缀，共 7 个字符）
            String token = authHeader.substring(7);

            // 4. 验证 token 是否有效
            if (jwtUtil.validateToken(token)) {
                // 5. 从 token 中提取用户 ID
                Long userId = jwtUtil.getUserIdFromToken(token);

                // 6. 如果用户 ID 有效，创建认证对象
                if (userId != null) {
                    // 创建认证对象
                    // 参数说明：
                    // - principal（主体）：用户 ID（可以理解为"是谁"）
                    // - credentials（凭证）：null（因为已经通过 token 验证了，不需要密码）
                    // - authorities（权限）：空列表（这个项目没有使用角色/权限系统）
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,           // principal：用户 ID
                                    null,             // credentials：不需要密码
                                    Collections.emptyList()  // authorities：权限列表（空）
                            );

                    // 7. 将认证对象设置到 Security 上下文中
                    // 这样后续代码就可以通过 SecurityContextHolder 获取当前用户
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        // 8. 继续执行过滤器链
        // 必须调用这个方法，否则请求不会继续传递到控制器
        filterChain.doFilter(request, response);
    }
}
