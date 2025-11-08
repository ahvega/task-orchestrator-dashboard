/**
 * Current Project Component
 * 
 * Displays the currently selected project with features and tasks.
 * Replaces the Overview tab content when a project is selected.
 */

class CurrentProject {
    constructor() {
        this.container = document.getElementById('current-project-section');
        this.currentProjectId = null;
        this.days = 7; // Default to last 7 days
        
        this.init();
    }
    
    init() {
        // Listen for project selection changes
        window.addEventListener('project-selected', (e) => {
            this.loadProject(e.detail.projectId);
        });
        
        // Check if a project is already selected
        if (window.appState) {
            const projectId = window.appState.getProjectId();
            if (projectId) {
                this.loadProject(projectId);
            } else {
                this.showEmptyState();
            }
        } else {
            this.showEmptyState();
        }
    }
    
    async loadProject(projectId, days = null) {
        if (!projectId) {
            this.showEmptyState();
            return;
        }
        
        this.currentProjectId = projectId;
        if (days !== null) {
            this.days = days;
        }
        
        try {
            this.showLoading();
            
            const url = `/api/projects/${projectId}/overview?days=${this.days}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.render(data);
        } catch (error) {
            console.error('Failed to load project:', error);
            this.showError(error.message);
        }
    }
    
    showLoading() {
        this.container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading project details...</p>
            </div>
        `;
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3 class="empty-state-title">Error Loading Project</h3>
                <p class="empty-state-text">${this.escapeHtml(message)}</p>
                <button class="btn-primary" onclick="window.projectSelector.open()">
                    Select Different Project
                </button>
            </div>
        `;
    }
    
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3 class="empty-state-title">No Project Selected</h3>
                <p class="empty-state-text">Select a project to view its details, features, and tasks</p>
                <button class="btn-primary" onclick="window.projectSelector.open()">
                    Select Project
                </button>
            </div>
        `;
    }
    
    render(data) {
        const { project, features, tasks, stats } = data;
        
        // Use total task counts (unfiltered) for overall completion percentage
        // This ensures the completion circle shows the true project completion,
        // not just completion of recently modified tasks
        const completedTasks = stats.total_completed_count || 0;
        const totalTasks = stats.total_task_count || 0;
        const completionPercentage = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;
        
        // Get complexity and feature completion percentages from stats
        const complexityCompletion = stats.complexity_completion_percentage || 0;
        const featureCompletion = stats.feature_completion_percentage || 0;
        
        this.container.innerHTML = `
            <!-- Project Header -->
            <div class="current-project-header">
                <div class="project-header-content">
                    <div class="project-header-left">
                        <h1 class="current-project-title">${this.escapeHtml(project.name)}</h1>
                        ${project.summary ? `<p class="current-project-summary">${this.escapeHtml(project.summary)}</p>` : ''}
                        <div class="project-completion-metrics">
                            <span class="completion-metric">
                                <span class="metric-icon">⚡</span>
                                <span class="metric-label">Complexity:</span>
                                <span class="metric-value">${complexityCompletion}%</span>
                            </span>
                            <span class="completion-metric-separator">•</span>
                            <span class="completion-metric">
                                <span class="metric-icon">📦</span>
                                <span class="metric-label">Features:</span>
                                <span class="metric-value">${featureCompletion}%</span>
                            </span>
                            <span class="completion-metric-separator">•</span>
                            <span class="completion-metric">
                                <span class="metric-icon">✓</span>
                                <span class="metric-label">Tasks:</span>
                                <span class="metric-value">${completionPercentage}%</span>
                            </span>
                        </div>
                        <div class="current-project-meta">
                            ${project.status ? `
                                <div class="meta-item">
                                    <span>📊</span>
                                    <span class="meta-value">${project.status}</span>
                                </div>
                            ` : ''}
                            <div class="meta-item">
                                <span>📦</span>
                                <span class="meta-value">${stats.feature_count}</span>
                                <span>features</span>
                            </div>
                            <div class="meta-item">
                                <span>✓</span>
                                <span class="meta-value">${stats.task_count}</span>
                                <span>tasks</span>
                            </div>
                            <div class="meta-item">
                                <span>🔗</span>
                                <span class="meta-value">${stats.dependency_count}</span>
                                <span>dependencies</span>
                            </div>
                            <div class="meta-item">
                                <span>📄</span>
                                <span class="meta-value">${stats.section_count}</span>
                                <span>sections</span>
                            </div>
                        </div>
                    </div>
                    <div class="project-header-right">
                        <div class="project-completion-circle">
                            <div class="completion-percentage">${completionPercentage}%</div>
                            <div class="completion-label">Complete</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features Section -->
            ${features.length > 0 ? `
                <div class="section-header">
                    <h2 class="section-title">Features</h2>
                </div>
                <div class="features-grid">
                    ${features.map(feature => this.renderFeatureCard(feature)).join('')}
                </div>
            ` : ''}

            <!-- Recent Tasks Section -->
            <div class="section-header">
                <h2 class="section-title">Recent Tasks</h2>
                <div class="activity-controls">
                    <select id="recent-tasks-days-filter" class="days-filter">
                        <option value="1">Last 24 hours</option>
                        <option value="7" selected>Last 7 days</option>
                        <option value="14">Last 14 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>
            </div>
            ${tasks.length > 0 ? `
                <div class="tasks-list-with-dates">
                    <table class="tasks-table">
                        <thead>
                            <tr>
                                <th class="col-datetime">Modified</th>
                                <th class="col-status">Status</th>
                                <th class="col-task-title">Task</th>
                                <th class="col-feature">Feature</th>
                                <th class="col-priority">Priority</th>
                                <th class="col-complexity">Complexity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.map(task => this.renderTaskRow(task)).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="empty-state">
                    <p>No tasks found in this time period</p>
                </div>
            `}
        `;
        
        // Add event handler for days filter
        const daysFilter = this.container.querySelector('#recent-tasks-days-filter');
        if (daysFilter) {
            daysFilter.value = this.days.toString();
            daysFilter.addEventListener('change', async (e) => {
                const value = e.target.value;
                this.days = value === 'all' ? null : parseInt(value);
                await this.loadProject(this.currentProjectId, this.days);
            });
        }
        
        // Add click handlers for task rows
        this.container.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('click', () => {
                const taskId = row.dataset.taskId;
                if (taskId && window.detailModal) {
                    window.detailModal.show(taskId, 'task');
                }
            });
        });
    }
    
    renderTaskRow(task) {
        const datetime = this.formatDateTime(task.modified_at);
        const taskTitle = this.escapeHtml(task.title);
        const featureName = task.feature_name ? this.escapeHtml(task.feature_name) : '-';
        
        return `
            <tr class="task-row" data-task-id="${task.id}">
                <td class="col-datetime">
                    <span class="datetime-text">${datetime}</span>
                </td>
                <td class="col-status">
                    <span class="task-status-badge ${task.status || 'pending'}">${task.status || 'pending'}</span>
                </td>
                <td class="col-task-title">
                    <span class="task-title">${taskTitle}</span>
                </td>
                <td class="col-feature">
                    <span class="feature-name">${featureName}</span>
                </td>
                <td class="col-priority">
                    ${task.priority ? `<span class="task-priority-badge ${task.priority}">${task.priority}</span>` : '-'}
                </td>
                <td class="col-complexity">
                    ${task.complexity ? `<span class="task-complexity-badge">C:${task.complexity}</span>` : '-'}
                </td>
            </tr>
        `;
    }
    
    formatDateTime(dateStr) {
        if (!dateStr) return 'Unknown';
        
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            
            return date.toLocaleDateString();
        } catch (error) {
            return 'Unknown';
        }
    }
    
    renderFeatureCard(feature) {
        const completionRate = feature.task_count > 0
            ? Math.round((feature.completed_count / feature.task_count) * 100)
            : 0;
        
        return `
            <div class="feature-card">
                <div class="feature-card-header">
                    <h3 class="feature-card-name">${this.escapeHtml(feature.name)}</h3>
                    ${feature.status ? `<span class="feature-card-status ${feature.status}">${feature.status}</span>` : ''}
                </div>
                <div class="feature-card-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${completionRate}%"></div>
                    </div>
                    <div class="progress-text">
                        ${feature.completed_count} of ${feature.task_count} tasks completed (${completionRate}%)
                    </div>
                </div>
                <div class="feature-card-tasks">
                    <div class="task-stat">
                        <span class="text-success">✓</span>
                        <span>${feature.completed_count} completed</span>
                    </div>
                    <div class="task-stat">
                        <span class="text-primary">→</span>
                        <span>${feature.in_progress_count} in progress</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.currentProject = new CurrentProject();
    });
} else {
    window.currentProject = new CurrentProject();
}
