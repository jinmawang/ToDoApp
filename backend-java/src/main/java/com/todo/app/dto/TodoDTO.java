package com.todo.app.dto;

import com.todo.app.entity.Todo;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public class TodoCreateDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description = "";

    private Todo.Priority priority = Todo.Priority.MEDIUM;

    private LocalDate dueDate;

    private Long categoryId;

    private List<SubTaskCreateDTO> subtasks;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Todo.Priority getPriority() { return priority; }
    public void setPriority(Todo.Priority priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public List<SubTaskCreateDTO> getSubtasks() { return subtasks; }
    public void setSubtasks(List<SubTaskCreateDTO> subtasks) { this.subtasks = subtasks; }
}
