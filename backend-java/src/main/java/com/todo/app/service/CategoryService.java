package com.todo.app.service;

import com.todo.app.dto.CategoryCreateDTO;
import com.todo.app.dto.CategoryUpdateDTO;
import com.todo.app.entity.Category;
import com.todo.app.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    private static final Long DEFAULT_USER_ID = 1L;

    public Category createCategory(CategoryCreateDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setColor(dto.getColor() != null ? dto.getColor() : "#3B82F6");
        category.setIcon(dto.getIcon() != null ? dto.getIcon() : "");
        category.setUserId(DEFAULT_USER_ID);
        category.setCreatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findByUserIdOrderByCreatedAtDesc(DEFAULT_USER_ID);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }

    public Category updateCategory(Long id, CategoryUpdateDTO dto) {
        Category category = getCategoryById(id);

        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getColor() != null) {
            category.setColor(dto.getColor());
        }
        if (dto.getIcon() != null) {
            category.setIcon(dto.getIcon());
        }

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
