package com.todo.app.dto;

import com.todo.app.entity.Todo;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TodoCreateDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description = "";

    private Todo.Priority priority = Todo.Priority.MEDIUM;

    private LocalDate dueDate;

    private Long categoryId;

    private List<SubTaskCreateDTO> subtasks;
}
