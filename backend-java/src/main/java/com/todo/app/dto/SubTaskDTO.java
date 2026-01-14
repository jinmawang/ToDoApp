package com.todo.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubTaskCreateDTO {

    @NotBlank(message = "SubTask title is required")
    private String title;
}
