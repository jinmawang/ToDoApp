package com.todo.app.repository;

import com.todo.app.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.category c LEFT JOIN FETCH t.subtasks s WHERE t.id = :id")
    Todo findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT t FROM Todo t WHERE t.userId = :userId " +
           "AND (:search IS NULL OR t.title LIKE %:search% OR t.description LIKE %:search%) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:categoryId IS NULL OR t.categoryId = :categoryId) " +
           "AND (:isCompleted IS NULL OR t.isCompleted = :isCompleted) " +
           "ORDER BY t.createdAt DESC")
    List<Todo> findAllWithFilters(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("priority") Todo.Priority priority,
            @Param("categoryId") Long categoryId,
            @Param("isCompleted") Boolean isCompleted
    );

    List<Todo> findByUserIdOrderByCreatedAtDesc(Long userId);
}
