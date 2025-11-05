/**
 * Kanban Board Component
 * Task management in column-based view
 */

class KanbanBoard {
    constructor(containerId) {
        this.containerId = containerId;
        this.tasks = [];
        this.dependencies = [];
        this.filters = {
            project: null,
            feature: null,
            priority: null,
            tags: []
        };
        this.columns = {
            pending: { title: '📋 Pending', tasks: [] },
            'in-progress': { title: '🔄 In Progress', tasks: [] },
            completed: { title: '✅ Completed', tasks: [] },
            blocked: { title: '🚫 Blocked', tasks: [] }
        };
    }

    /**
     * Initialize the Kanban board
     */
    async init() {
        try {
            await this.loadData();
            this.organizeColumns();
            this.render();
            this.setupWebSocketListener();
        } catch (error) {
            console.error('Failed to initialize Kanban board:', error);
            this.showError('Failed to load Kanban board');
        }
    }

    /**
     * Load data from API
     */
    async loadData() {
        try {
            // Get selected project from global state
            const projectId = window.appState ? window.appState.getProjectId() : null;
            
            const [tasks, dependencies] = await Promise.all([
                api.getTasks(),
                api.getDependencies()
            ]);

            // Filter by project if one is selected
            this.tasks = projectId 
                ? tasks.filter(task => task.project_id === projectId)
                : tasks;
            this.dependencies = dependencies;

            console.log(`Loaded ${this.tasks.length} tasks for Kanban (project: ${projectId || 'all'})`);
        } catch (error) {
            console.error('Failed to load Kanban data:', error);
            throw error;
        }
    }

    /**
     * Organize tasks into columns
     */
    organizeColumns() {
        // Reset columns
        Object.keys(this.columns).forEach(key => {
            this.columns[key].tasks = [];
        });

        // Get blocked task IDs
        const blockedTaskIds = this.getBlockedTaskIds();

        // Organize tasks
        this.tasks.forEach(task => {
            // Check if task is blocked
            if (blockedTaskIds.has(task.id)) {
                this.columns.blocked.tasks.push(task);
            } else {
                // Put in regular status column
                const status = task.status || 'pending';
                if (this.columns[status]) {
                    this.columns[status].tasks.push(task);
                } else {
                    // Default to pending if unknown status
                    this.columns.pending.tasks.push(task);
                }
            }
        });
    }

    /**
     * Get IDs of tasks that are blocked by dependencies
     */
    getBlockedTaskIds() {
        const blockedIds = new Set();

        this.dependencies.forEach(dep => {
            if (dep.type === 'BLOCKS' || dep.type === 'IS_BLOCKED_BY') {
                // Find the task being blocked
                const blockedTaskId = dep.type === 'BLOCKS' ? dep.to_task_id : dep.from_task_id;

                // Check if the blocking task is not completed
                const blockingTaskId = dep.type === 'BLOCKS' ? dep.from_task_id : dep.to_task_id;
                const blockingTask = this.tasks.find(t => t.id === blockingTaskId);

                if (blockingTask && blockingTask.status !== 'completed') {
                    blockedIds.add(blockedTaskId);
                }
            }
        });

        return blockedIds;
    }

    /**
     * Render the Kanban board
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

        container.innerHTML = Object.entries(this.columns).map(([key, column]) => {
            return this.renderColumn(key, column);
        }).join('');

        // Add event listeners to task cards
        this.setupTaskCardListeners();
    }

    /**
     * Render a single column
     */
    renderColumn(columnKey, column) {
        const taskCards = column.tasks.map(task => this.renderTaskCard(task)).join('');

        return `
            <div class="kanban-column" data-column="${columnKey}">
                <div class="kanban-header">
                    <h3 class="kanban-title">${column.title}</h3>
                    <span class="task-count">${column.tasks.length}</span>
                </div>
                <div class="kanban-tasks" id="kanban-${columnKey}">
                    ${taskCards || '<p style="color: var(--text-secondary); padding: 1rem; text-align: center;">No tasks</p>'}
                </div>
            </div>
        `;
    }

    /**
     * Render a task card
     */
    renderTaskCard(task) {
        const priorityBadge = Formatters.priorityBadge(task.priority);
        const complexityIndicator = Formatters.complexityIndicator(task.complexity);
        const tags = task.tags && task.tags.length > 0
            ? task.tags.slice(0, 3).map(tag => `<span class="badge-tag">${Formatters.escapeHtml(tag)}</span>`).join(' ')
            : '';

        return `
            <div class="task-card draggable" draggable="true" data-task-id="${task.id}" data-task-status="${task.status}">
                <div class="task-title" data-field="title">${Formatters.escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="editable-badge" data-field="priority">${priorityBadge}</span>
                    <span class="editable-badge" data-field="complexity">${complexityIndicator}</span>
                    ${tags}
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners for task cards
     */
    setupTaskCardListeners() {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            // Click to show details
            card.addEventListener('click', (e) => {
                // Don't show details if clicking on editable elements
                if (e.target.closest('.editable-badge')) {
                    return;
                }
                const taskId = card.getAttribute('data-task-id');
                this.showTaskDetails(taskId);
            });

            // Setup drag and drop
            this.setupDragAndDrop(card);

            // Make elements editable
            this.makeCardEditable(card);
        });

        // Setup drop zones
        this.setupDropZones();
    }

    /**
     * Make card elements editable
     */
    makeCardEditable(card) {
        const taskId = card.getAttribute('data-task-id');
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Make priority editable
        const priorityBadge = card.querySelector('[data-field="priority"]');
        if (priorityBadge && taskEditor) {
            taskEditor.makePriorityEditable(priorityBadge, taskId, task.priority);
        }

        // Make complexity editable
        const complexityIndicator = card.querySelector('[data-field="complexity"]');
        if (complexityIndicator && taskEditor) {
            taskEditor.makeComplexityEditable(complexityIndicator, taskId, task.complexity);
        }

        // Make title editable
        const titleElement = card.querySelector('[data-field="title"]');
        if (titleElement && taskEditor) {
            taskEditor.makeTextEditable(titleElement, taskId, 'title', task.title);
        }
    }

    /**
     * Setup drag and drop for a card
     */
    setupDragAndDrop(card) {
        card.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
        });

        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
        });
    }

    /**
     * Setup drop zones for columns
     */
    setupDropZones() {
        const columns = document.querySelectorAll('.kanban-tasks');
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', (e) => {
                if (e.target === column) {
                    column.classList.remove('drag-over');
                }
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                column.classList.remove('drag-over');

                const taskId = e.dataTransfer.getData('text/plain');
                const columnId = column.id.replace('kanban-', '');
                
                this.handleCardDrop(taskId, columnId);
            });
        });
    }

    /**
     * Handle card drop to new column
     */
    async handleCardDrop(taskId, newColumnKey) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const oldStatus = task.status;
        const newStatus = newColumnKey;

        // Don't update if dropped in same column
        if (oldStatus === newStatus) return;

        console.log(`Dropping task ${taskId} from ${oldStatus} to ${newStatus}`);

        try {
            // Update via API
            await api.updateTaskStatus(taskId, newStatus);

            // Success - reload board
            await this.reload();

            // Show success message
            this.showSuccessToast(`Task moved to ${newStatus}`);

        } catch (error) {
            console.error('Failed to update task status:', error);
            this.showError('Failed to move task');
            // Reload to restore correct state
            await this.reload();
        }
    }

    /**
     * Show success toast
     */
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    /**
     * Setup WebSocket listener
     */
    setupWebSocketListener() {
        wsClient.on('database_update', () => {
            console.log('Database updated, reloading Kanban...');
            this.reload();
        });

        wsClient.on('task_update', (data) => {
            console.log('Task updated:', data);
            this.reload();
        });

        // Listen for project selection changes
        window.addEventListener('project-selected', () => {
            console.log('Project changed, reloading Kanban...');
            this.reload();
        });
    }

    /**
     * Reload Kanban board
     */
    async reload() {
        try {
            await this.loadData();
            this.organizeColumns();
            this.render();
        } catch (error) {
            console.error('Failed to reload Kanban:', error);
            Helpers.showToast('Failed to reload Kanban board', 'error');
        }
    }

    /**
     * Show task details modal
     */
    showTaskDetails(taskId) {
        if (window.detailModal) {
            window.detailModal.show(taskId, 'task');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #ef4444;">
                    <p>${message}</p>
                    <button onclick="kanbanBoard.init()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Create global instance (initialized in main.js)
let kanbanBoard = null;
