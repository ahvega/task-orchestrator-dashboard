/**
 * Enhanced Timeline Component
 * Activity grid showing recent updates with project context
 */

class Timeline {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.activities = [];
        this.days = 7;
        this.projectId = null;
    }

    /**
     * Initialize timeline
     */
    async init() {
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            console.warn(`Container #${this.containerId} not found`);
            return;
        }

        // Subscribe to project changes
        if (window.appState) {
            window.appState.subscribe((state) => {
                this.onProjectChange(state.projectId);
            });
        }

        try {
            await this.load();
            this.setupWebSocketListener();
            console.log('Timeline initialized');
        } catch (error) {
            console.error('Failed to initialize timeline:', error);
            this.renderError();
        }
    }

    /**
     * Handle project change
     */
    async onProjectChange(projectId) {
        this.projectId = projectId;
        await this.load();
    }

    /**
     * Load activities from API
     */
    async load() {
        try {
            this.renderLoading();
            
            // Get project context if available
            const projectId = window.appState ? window.appState.getProjectId() : null;
            
            // Load tasks and derive activities
            const tasks = await api.getTasks({ project_id: projectId });

            // Create activities from task modifications
            this.activities = tasks
                .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at))
                .slice(0, 50)
                .map(task => ({
                    task_id: task.id,
                    task_title: task.title,
                    project_name: task.project_name || 'No Project',
                    project_id: task.project_id || null,
                    feature_name: task.feature_name || null,
                    timestamp: task.modified_at,
                    action: this.determineAction(task),
                    status: task.status,
                    priority: task.priority
                }));

            this.render();
        } catch (error) {
            console.error('Failed to load timeline:', error);
            this.renderError();
        }
    }

    /**
     * Determine action type from task data
     */
    determineAction(task) {
        // Simple heuristic: check if created_at and modified_at are close
        const created = new Date(task.created_at);
        const modified = new Date(task.modified_at);
        const diffSeconds = (modified - created) / 1000;
        
        if (diffSeconds < 60) {
            return 'created';
        } else if (task.status === 'completed') {
            return 'completed';
        } else {
            return 'updated';
        }
    }

    /**
     * Render activity grid
     */
    render() {
        if (!this.container) return;
        
        if (!this.activities || this.activities.length === 0) {
            this.renderEmpty();
            return;
        }

        const html = `
            <div class="activity-grid-container">
                <div class="activity-header">
                    <h3>Recent Activity</h3>
                    <div class="activity-controls">
                        <select id="activity-days-filter" class="days-filter">
                            <option value="1">Last 24 hours</option>
                            <option value="7" selected>Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                        </select>
                    </div>
                </div>
                <div class="activity-grid">
                    <table class="activity-table">
                        <thead>
                            <tr>
                                <th class="col-datetime">Date/Time</th>
                                <th class="col-project">Project</th>
                                <th class="col-task">Task</th>
                                <th class="col-action">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.activities.map(activity => this.renderActivityRow(activity)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Add event handler for days filter
        const daysFilter = this.container.querySelector('#activity-days-filter');
        if (daysFilter) {
            daysFilter.value = this.days.toString();
            daysFilter.addEventListener('change', async (e) => {
                this.days = parseInt(e.target.value);
                await this.load();
            });
        }

        // Add click handlers for rows
        this.container.querySelectorAll('.activity-row').forEach(row => {
            row.addEventListener('click', () => {
                const taskId = row.dataset.taskId;
                if (taskId && window.detailModal) {
                    window.detailModal.show(taskId, 'task');
                }
            });
        });
    }

    /**
     * Render single activity row
     */
    renderActivityRow(activity) {
        const datetime = this.formatDateTime(activity.timestamp);
        const projectName = this.truncate(activity.project_name || 'No Project', 25);
        const taskTitle = this.truncate(activity.task_title, 50);
        const actionClass = this.getActionClass(activity.action);
        const actionLabel = this.getActionLabel(activity.action);

        return `
            <tr class="activity-row" data-task-id="${activity.task_id}">
                <td class="col-datetime">
                    <span class="datetime-text">${datetime}</span>
                </td>
                <td class="col-project">
                    <span class="project-name" title="${activity.project_name || 'No Project'}">
                        ${projectName}
                    </span>
                </td>
                <td class="col-task">
                    <span class="task-title" title="${activity.task_title}">
                        ${taskTitle}
                    </span>
                </td>
                <td class="col-action">
                    <span class="action-badge ${actionClass}">
                        ${actionLabel}
                    </span>
                </td>
            </tr>
        `;
    }

    /**
     * Format datetime to short format (MM/DD HH:mm)
     */
    formatDateTime(timestamp) {
        if (!timestamp) return '--/-- --:--';
        
        const date = new Date(timestamp);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return '--/-- --:--';
        }
        
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    }

    /**
     * Get action class for styling
     */
    getActionClass(action) {
        const actionMap = {
            'created': 'action-created',
            'updated': 'action-updated',
            'completed': 'action-completed',
            'status_changed': 'action-status-changed',
            'assigned': 'action-assigned'
        };
        return actionMap[action] || 'action-default';
    }

    /**
     * Get human-readable action label
     */
    getActionLabel(action) {
        const labelMap = {
            'created': 'Created',
            'updated': 'Updated',
            'completed': 'Completed',
            'status_changed': 'Status Changed',
            'assigned': 'Assigned'
        };
        return labelMap[action] || action;
    }

    /**
     * Truncate text with ellipsis
     */
    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Setup WebSocket listener
     */
    setupWebSocketListener() {
        if (typeof wsClient !== 'undefined') {
            wsClient.on('database_update', () => {
                console.log('Database updated, reloading timeline...');
                this.load();
            });

            wsClient.on('task_update', (data) => {
                console.log('Task updated, reloading timeline...');
                this.load();
            });
        }
    }

    /**
     * Render loading state
     */
    renderLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="activity-loading">
                <div class="spinner"></div>
                <p>Loading activity...</p>
            </div>
        `;
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="activity-empty">
                <p>No recent activity</p>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="activity-error">
                <p>Failed to load activity</p>
                <button class="btn-primary" onclick="window.timeline.load()">
                    Retry
                </button>
            </div>
        `;
    }
}

// Create global instance (initialized in main.js)
let timeline = null;
