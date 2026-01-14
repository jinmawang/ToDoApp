package com.todo.app.controller;

import com.todo.app.dto.StatisticsDTO;
import com.todo.app.dto.SubTaskCreateDTO;
import com.todo.app.dto.TodoCreateDTO;
import com.todo.app.dto.TodoUpdateDTO;
import com.todo.app.entity.SubTask;
import com.todo.app.entity.Todo;
import com.todo.app.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/todos")
@RequiredArgsConstructor
@Tag(name = "Todos", description = "Todo management APIs")
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    @Operation(summary = "Create a new todo")
    public ResponseEntity<Todo> createTodo(@Valid @RequestBody TodoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createTodo(dto));
    }

    @GetMapping
    @Operation(summary = "Get all todos with filters")
    public ResponseEntity<List<Todo>> getAllTodos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isCompleted
    ) {
        return ResponseEntity.ok(todoService.getAllTodos(search, priority, categoryId, isCompleted));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get todo statistics")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        return ResponseEntity.ok(todoService.getStatistics());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get todo by ID")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update todo")
    public ResponseEntity<Todo> updateTodo(
            @PathVariable Long id,
            @RequestBody TodoUpdateDTO dto
    ) {
        return ResponseEntity.ok(todoService.updateTodo(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle todo completion status")
    public ResponseEntity<Todo> toggleTodo(@PathVariable Long id) {
        return ResponseEntity.ok(todoService.toggleTodo(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete todo")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch")
    @Operation(summary = "Batch delete todos")
    public ResponseEntity<Void> batchDeleteTodos(@RequestBody List<Long> ids) {
        todoService.batchDeleteTodos(ids);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/batch/update")
    @Operation(summary = "Batch update todos")
    public ResponseEntity<List<Todo>> batchUpdateTodos(
            @RequestBody List<Long> ids,
            @RequestParam(required = false) Boolean isCompleted
    ) {
        return ResponseEntity.ok(todoService.batchUpdateTodos(ids, isCompleted));
    }

    // SubTask endpoints
    @PostMapping("/{todoId}/subtasks")
    @Operation(summary = "Create subtask for a todo")
    public ResponseEntity<SubTask> createSubTask(
            @PathVariable Long todoId,
            @Valid @RequestBody SubTaskCreateDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createSubTask(todoId, dto));
    }

    @PatchMapping("/subtasks/{subtaskId}/toggle")
    @Operation(summary = "Toggle subtask completion status")
    public ResponseEntity<SubTask> toggleSubTask(@PathVariable Long subtaskId) {
        return ResponseEntity.ok(todoService.toggleSubTask(subtaskId));
    }

    @DeleteMapping("/subtasks/{subtaskId}")
    @Operation(summary = "Delete subtask")
    public ResponseEntity<Void> deleteSubTask(@PathVariable Long subtaskId) {
        todoService.deleteSubTask(subtaskId);
        return ResponseEntity.noContent().build();
    }
}
