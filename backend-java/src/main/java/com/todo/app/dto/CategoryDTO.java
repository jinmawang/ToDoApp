package com.todo.app.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryCreateDTO {

    @NotBlank(message = "Category name is required")
    private String name;

    private String color = "#3B82F6";

    private String icon = "";

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}

public class CategoryUpdateDTO {

    private String name;

    private String color;

    private String icon;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
