package com.todo.app.service;

import com.todo.app.dto.*;
import com.todo.app.entity.User;
import com.todo.app.repository.UserRepository;
import com.todo.app.security.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserResponseDTO register(RegisterDTO registerDTO) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "用户名已存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    public TokenDTO login(LoginDTO loginDTO) {
        // 查找用户
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误"));

        // 验证密码
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误");
        }

        // 生成 JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getUsername());

        TokenDTO tokenDTO = new TokenDTO();
        tokenDTO.setAccessToken(token);
        tokenDTO.setUser(UserResponseDTO.fromEntity(user));

        return tokenDTO;
    }

    public UserResponseDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户不存在"));
        return UserResponseDTO.fromEntity(user);
    }

    @Transactional
    public UserResponseDTO updateProfile(Long userId, RegisterDTO updateData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户不存在"));

        // 如果要更新用户名，检查是否重复
        if (updateData.getUsername() != null && !updateData.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updateData.getUsername())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "用户名已存在");
            }
            user.setUsername(updateData.getUsername());
        }

        // 如果要更新邮箱，检查是否重复
        if (updateData.getEmail() != null && !updateData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateData.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "邮箱已被使用");
            }
            user.setEmail(updateData.getEmail());
        }

        // 如果要更新密码
        if (updateData.getPassword() != null && !updateData.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }
}
