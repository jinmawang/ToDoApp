package com.todo.app.service;

import com.todo.app.dto.*;
import com.todo.app.entity.SubTask;
import com.todo.app.entity.Todo;
import com.todo.app.repository.SubTaskRepository;
import com.todo.app.repository.TodoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final SubTaskRepository subTaskRepository;

    private static final Long DEFAULT_USER_ID = 1L;

    @Transactional
    public Todo createTodo(TodoCreateDTO dto) {
        Todo todo = new Todo();
        todo.setTitle(dto.getTitle());
        todo.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        todo.setPriority(dto.getPriority() != null ? dto.getPriority() : Todo.Priority.MEDIUM);
        todo.setDueDate(dto.getDueDate());
        todo.setCategoryId(dto.getCategoryId());
        todo.setUserId(DEFAULT_USER_ID);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());

        todo = todoRepository.save(todo);

        if (dto.getSubtasks() != null && !dto.getSubtasks().isEmpty()) {
            for (SubTaskCreateDTO subTaskDto : dto.getSubtasks()) {
                SubTask subTask = new SubTask();
                subTask.setTitle(subTaskDto.getTitle());
                subTask.setTodoId(todo.getId());
                subTask.setCreatedAt(LocalDateTime.now());
                subTaskRepository.save(subTask);
            }

            todo.setProgress(calculateProgress(todo.getId()));
            todo = todoRepository.save(todo);
        }

        return todoRepository.findByIdWithRelations(todo.getId());
    }

    public List<Todo> getAllTodos(String search, String priority, Long categoryId, Boolean isCompleted) {
        Todo.Priority priorityEnum = null;
        if (priority != null) {
            priorityEnum = Todo.Priority.valueOf(priority.toUpperCase());
        }

        return todoRepository.findAllWithFilters(
                DEFAULT_USER_ID, search, priorityEnum, categoryId, isCompleted
        );
    }

    public Todo getTodoById(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found with id: " + id));
    }

    @Transactional
    public Todo updateTodo(Long id, TodoUpdateDTO dto) {
        Todo todo = getTodoById(id);

        if (dto.getTitle() != null) {
            todo.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            todo.setDescription(dto.getDescription());
        }
        if (dto.getIsCompleted() != null) {
            todo.setIsCompleted(dto.getIsCompleted());
        }
        if (dto.getPriority() != null) {
            todo.setPriority(dto.getPriority());
        }
        if (dto.getDueDate() != null) {
            todo.setDueDate(dto.getDueDate());
        }
        if (dto.getCategoryId() != null) {
            todo.setCategoryId(dto.getCategoryId());
        }
        if (dto.getProgress() != null) {
            todo.setProgress(dto.getProgress());
        }

        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    @Transactional
    public Todo toggleTodo(Long id) {
        Todo todo = getTodoById(id);
        todo.setIsCompleted(!todo.getIsCompleted());
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        Todo todo = getTodoById(id);
        todoRepository.delete(todo);
    }

    @Transactional
    public void batchDeleteTodos(List<Long> ids) {
        List<Todo> todos = todoRepository.findAllById(ids);
        todoRepository.deleteAll(todos);
    }

    @Transactional
    public List<Todo> batchUpdateTodos(List<Long> ids, Boolean isCompleted) {
        List<Todo> todos = todoRepository.findAllById(ids);
        if (isCompleted != null) {
            for (Todo todo : todos) {
                todo.setIsCompleted(isCompleted);
                todo.setUpdatedAt(LocalDateTime.now());
            }
        }
        return todoRepository.saveAll(todos);
    }

    public StatisticsDTO getStatistics() {
        List<Todo> todos = todoRepository.findByUserIdOrderByCreatedAtDesc(DEFAULT_USER_ID);

        StatisticsDTO stats = new StatisticsDTO();
        stats.setTotal(todos.size());
        stats.setCompleted((int) todos.stream().filter(Todo::getIsCompleted).count());
        stats.setPending(todos.size() - stats.getCompleted());
        stats.setCompletionRate(todos.size() > 0 ? (stats.getCompleted() * 100 / todos.size()) : 0);

        Map<String, Integer> priorityStats = new HashMap<>();
        priorityStats.put("high", (int) todos.stream().filter(t -> t.getPriority() == Todo.Priority.HIGH).count());
        priorityStats.put("medium", (int) todos.stream().filter(t -> t.getPriority() == Todo.Priority.MEDIUM).count());
        priorityStats.put("low", (int) todos.stream().filter(t -> t.getPriority() == Todo.Priority.LOW).count());
        stats.setPriorityStats(priorityStats);

        LocalDate today = LocalDate.now();
        long overdueCount = todos.stream()
                .filter(t -> !t.getIsCompleted())
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();
        stats.setOverdueCount((int) overdueCount);

        return stats;
    }

    @Transactional
    public SubTask createSubTask(Long todoId, SubTaskCreateDTO dto) {
        Todo todo = getTodoById(todoId);

        SubTask subTask = new SubTask();
        subTask.setTitle(dto.getTitle());
        subTask.setTodoId(todoId);
        subTask.setCreatedAt(LocalDateTime.now());
        subTask.setIsCompleted(false);

        subTask = subTaskRepository.save(subTask);

        todo.setProgress(calculateProgress(todoId));
        todoRepository.save(todo);

        return subTask;
    }

    @Transactional
    public SubTask toggleSubTask(Long subTaskId) {
        SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new EntityNotFoundException("SubTask not found with id: " + subTaskId));

        subTask.setIsCompleted(!subTask.getIsCompleted());
        subTask = subTaskRepository.save(subTask);

        Todo todo = todoRepository.findById(subTask.getTodoId()).orElse(null);
        if (todo != null) {
            todo.setProgress(calculateProgress(subTask.getTodoId()));
            todoRepository.save(todo);
        }

        return subTask;
    }

    @Transactional
    public void deleteSubTask(Long subTaskId) {
        SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new EntityNotFoundException("SubTask not found with id: " + subTaskId));

        Long todoId = subTask.getTodoId();
        subTaskRepository.delete(subTask);

        Todo todo = todoRepository.findById(todoId).orElse(null);
        if (todo != null) {
            todo.setProgress(calculateProgress(todoId));
            todoRepository.save(todo);
        }
    }

    private Integer calculateProgress(Long todoId) {
        List<SubTask> subtasks = subTaskRepository.findByTodoId(todoId);
        if (subtasks.isEmpty()) {
            return 0;
        }

        long completed = subtasks.stream().filter(SubTask::getIsCompleted).count();
        return (int) ((completed * 100) / subtasks.size());
    }
}
