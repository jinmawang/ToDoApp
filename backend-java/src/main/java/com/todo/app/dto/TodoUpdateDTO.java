package com.todo.app.dto;

import com.todo.app.entity.Todo;

import java.time.LocalDate;

public class TodoUpdateDTO {

    private String title;

    private String description;

    private Boolean isCompleted;

    private Todo.Priority priority;

    private LocalDate dueDate;

    private Long categoryId;

    private Integer progress;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
    public Todo.Priority getPriority() { return priority; }
    public void setPriority(Todo.Priority priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
}
