package com.todo.app.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TodoUpdateDTO {

    private String title;

    private String description;

    private Boolean isCompleted;

    private Todo.Priority priority;

    private LocalDate dueDate;

    private Long categoryId;

    private Integer progress;
}
