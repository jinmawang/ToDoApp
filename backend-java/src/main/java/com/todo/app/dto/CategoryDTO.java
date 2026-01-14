package com.todo.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryCreateDTO {

    @NotBlank(message = "Category name is required")
    private String name;

    private String color = "#3B82F6";

    private String icon = "";
}

@Data
class CategoryUpdateDTO {

    private String name;

    private String color;

    private String icon;
}
