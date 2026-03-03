package com.todo.app.dto;

import java.util.Map;

public class StatisticsDTO {

    private Integer total;
    private Integer completed;
    private Integer pending;
    private Integer completionRate;
    private Map<String, Integer> priorityStats;
    private Integer overdueCount;

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
    public Integer getCompleted() { return completed; }
    public void setCompleted(Integer completed) { this.completed = completed; }
    public Integer getPending() { return pending; }
    public void setPending(Integer pending) { this.pending = pending; }
    public Integer getCompletionRate() { return completionRate; }
    public void setCompletionRate(Integer completionRate) { this.completionRate = completionRate; }
    public Map<String, Integer> getPriorityStats() { return priorityStats; }
    public void setPriorityStats(Map<String, Integer> priorityStats) { this.priorityStats = priorityStats; }
    public Integer getOverdueCount() { return overdueCount; }
    public void setOverdueCount(Integer overdueCount) { this.overdueCount = overdueCount; }
}
