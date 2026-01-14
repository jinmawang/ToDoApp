package com.todo.app.dto;

import lombok.Data;

@Data
public class TokenDTO {
    private String accessToken;
    private UserResponseDTO user;
}
