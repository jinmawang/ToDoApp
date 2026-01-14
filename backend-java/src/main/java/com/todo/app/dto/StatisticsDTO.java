package com.todo.app.dto;

import lombok.Data;

import java.util.Map;

@Data
public class StatisticsDTO {

    private Integer total;
    private Integer completed;
    private Integer pending;
    private Integer completionRate;
    private Map<String, Integer> priorityStats;
    private Integer overdueCount;
}
