/**
 * Task Editor Component
 * Provides interactive editing capabilities for task properties
 */

class TaskEditor {
    constructor() {
        this.activeDropdown = null;
        this.editingField = null;
    }

    /**
     * Initialize the task editor
     */
    init() {
        this.setupGlobalClickHandler();
        this.setupKeyboardHandlers();
    }

    /**
     * Setup global click handler to close dropdowns
     */
    setupGlobalClickHandler() {
        document.addEventListener('click', (e) => {
            // Close dropdown if clicking outside
            if (this.activeDropdown && !e.target.closest('.editor-dropdown')) {
                this.closeDropdown();
            }
        });
    }

    /**
     * Setup keyboard handlers
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes dropdown or cancels editing
            if (e.key === 'Escape') {
                if (this.activeDropdown) {
                    this.closeDropdown();
                } else if (this.editingField) {
                    this.cancelEdit();
                }
            }
        });
    }

    /**
     * Make a badge clickable to edit status
     */
    makeStatusEditable(badgeElement, taskId, currentStatus) {
        badgeElement.style.cursor = 'pointer';
        badgeElement.title = 'Click to change status';
        
        badgeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showStatusDropdown(badgeElement, taskId, currentStatus);
        });
    }

    /**
     * Show status dropdown menu
     */
    showStatusDropdown(anchorElement, taskId, currentStatus) {
        this.closeDropdown(); // Close any existing dropdown

        const statuses = [
            { value: 'pending', label: '📋 Pending', color: '#6c757d' },
            { value: 'in-progress', label: '🔄 In Progress', color: '#0d6efd' },
            { value: 'completed', label: '✅ Completed', color: '#198754' },
            { value: 'blocked', label: '🚫 Blocked', color: '#dc3545' },
            { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
            { value: 'deferred', label: '⏸️ Deferred', color: '#ffc107' }
        ];

        const dropdown = this.createDropdown(statuses, currentStatus, async (newStatus) => {
            if (newStatus !== currentStatus) {
                await this.updateTaskStatus(taskId, newStatus, anchorElement);
            }
            this.closeDropdown();
        });

        this.positionDropdown(dropdown, anchorElement);
        this.activeDropdown = dropdown;
    }

    /**
     * Make priority badge editable
     */
    makePriorityEditable(badgeElement, taskId, currentPriority) {
        badgeElement.style.cursor = 'pointer';
        badgeElement.title = 'Click to change priority';
        
        badgeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPriorityDropdown(badgeElement, taskId, currentPriority);
        });
    }

    /**
     * Show priority dropdown menu
     */
    showPriorityDropdown(anchorElement, taskId, currentPriority) {
        this.closeDropdown();

        const priorities = [
            { value: 'high', label: '🔴 High', color: '#dc3545' },
            { value: 'medium', label: '🟡 Medium', color: '#ffc107' },
            { value: 'low', label: '🟢 Low', color: '#198754' }
        ];

        const dropdown = this.createDropdown(priorities, currentPriority, async (newPriority) => {
            if (newPriority !== currentPriority) {
                await this.updateTaskPriority(taskId, newPriority, anchorElement);
            }
            this.closeDropdown();
        });

        this.positionDropdown(dropdown, anchorElement);
        this.activeDropdown = dropdown;
    }

    /**
     * Make complexity indicator editable with slider
     */
    makeComplexityEditable(indicatorElement, taskId, currentComplexity) {
        indicatorElement.style.cursor = 'pointer';
        indicatorElement.title = 'Click to change complexity';
        
        indicatorElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showComplexitySlider(indicatorElement, taskId, currentComplexity);
        });
    }

    /**
     * Show complexity slider
     */
    showComplexitySlider(anchorElement, taskId, currentComplexity) {
        this.closeDropdown();

        const dropdown = document.createElement('div');
        dropdown.className = 'editor-dropdown complexity-slider';
        dropdown.innerHTML = `
            <div style="padding: 1rem; min-width: 200px;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Complexity: <span id="complexity-value">${currentComplexity}</span>
                </label>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value="${currentComplexity}"
                    id="complexity-slider"
                    style="width: 100%; cursor: pointer;"
                />
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    <span>1 (Simple)</span>
                    <span>10 (Complex)</span>
                </div>
                <button 
                    id="complexity-save"
                    style="width: 100%; margin-top: 1rem; padding: 0.5rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;"
                >
                    Save
                </button>
            </div>
        `;

        document.body.appendChild(dropdown);
        this.positionDropdown(dropdown, anchorElement);

        const slider = dropdown.querySelector('#complexity-slider');
        const valueDisplay = dropdown.querySelector('#complexity-value');
        const saveBtn = dropdown.querySelector('#complexity-save');

        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
        });

        saveBtn.addEventListener('click', async () => {
            const newComplexity = parseInt(slider.value);
            if (newComplexity !== currentComplexity) {
                await this.updateTaskComplexity(taskId, newComplexity, anchorElement);
            }
            this.closeDropdown();
        });

        this.activeDropdown = dropdown;
    }

    /**
     * Make text field editable (title, summary)
     */
    makeTextEditable(textElement, taskId, field, currentValue) {
        textElement.style.cursor = 'text';
        textElement.title = `Double-click to edit ${field}`;
        
        textElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.startTextEdit(textElement, taskId, field, currentValue);
        });
    }

    /**
     * Start text editing mode
     */
    startTextEdit(element, taskId, field, currentValue) {
        if (this.editingField) return; // Already editing something

        const originalHTML = element.innerHTML;
        const isMultiline = field === 'summary';

        // Create input element
        const input = document.createElement(isMultiline ? 'textarea' : 'input');
        input.value = currentValue || '';
        input.className = 'inline-editor';
        input.style.cssText = `
            width: 100%;
            padding: 0.5rem;
            font-family: inherit;
            font-size: inherit;
            border: 2px solid var(--primary);
            border-radius: 0.25rem;
            background: var(--bg-primary);
            color: var(--text-primary);
            outline: none;
            ${isMultiline ? 'min-height: 100px; resize: vertical;' : ''}
        `;

        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        this.editingField = { element, input, originalHTML, taskId, field, currentValue };

        // Save on blur
        input.addEventListener('blur', () => {
            setTimeout(() => this.saveTextEdit(), 100);
        });

        // Save on Enter (except for textarea)
        if (!isMultiline) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveTextEdit();
                }
            });
        }
    }

    /**
     * Save text edit
     */
    async saveTextEdit() {
        if (!this.editingField) return;

        const { element, input, originalHTML, taskId, field, currentValue } = this.editingField;
        const newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            // Show loading state
            element.innerHTML = '<span style="opacity: 0.5;">Saving...</span>';

            try {
                const updates = { [field]: newValue };
                await api.updateTask(taskId, updates);

                // Update display
                element.textContent = newValue;

                // Show success animation
                element.style.animation = 'highlight 0.5s';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);

            } catch (error) {
                console.error('Failed to update task:', error);
                element.innerHTML = originalHTML;
                this.showError(`Failed to update ${field}`);
            }
        } else {
            // Cancelled or no change
            element.innerHTML = originalHTML;
        }

        this.editingField = null;
    }

    /**
     * Cancel text edit
     */
    cancelEdit() {
        if (!this.editingField) return;

        const { element, originalHTML } = this.editingField;
        element.innerHTML = originalHTML;
        this.editingField = null;
    }

    /**
     * Create dropdown menu
     */
    createDropdown(options, currentValue, onSelect) {
        const dropdown = document.createElement('div');
        dropdown.className = 'editor-dropdown';
        
        dropdown.innerHTML = options.map(option => `
            <div class="dropdown-item ${option.value === currentValue ? 'active' : ''}" 
                 data-value="${option.value}"
                 style="padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; ${option.value === currentValue ? 'background: var(--primary); color: white;' : ''}">
                <span style="color: ${option.value === currentValue ? 'white' : option.color}; font-weight: 500;">${option.label}</span>
            </div>
        `).join('');

        // Add click handlers
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--bg-tertiary)';
            });
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.background = '';
                }
            });
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = item.getAttribute('data-value');
                onSelect(value);
            });
        });

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.body.appendChild(dropdown);
        return dropdown;
    }

    /**
     * Position dropdown relative to anchor
     */
    positionDropdown(dropdown, anchor) {
        const rect = anchor.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${rect.bottom + 5}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.zIndex = '10000';
        dropdown.style.minWidth = `${rect.width}px`;
    }

    /**
     * Close active dropdown
     */
    closeDropdown() {
        if (this.activeDropdown) {
            this.activeDropdown.remove();
            this.activeDropdown = null;
        }
    }

    /**
     * Update task status
     */
    async updateTaskStatus(taskId, newStatus, badgeElement) {
        const originalHTML = badgeElement.innerHTML;
        badgeElement.innerHTML = '<span style="opacity: 0.5;">Updating...</span>';

        try {
            await api.updateTaskStatus(taskId, newStatus);
            
            // Update badge display
            badgeElement.innerHTML = Formatters.statusBadge(newStatus);
            
            // Re-attach editor
            this.makeStatusEditable(badgeElement, taskId, newStatus);

            // Success animation
            badgeElement.style.animation = 'highlight 0.5s';
            setTimeout(() => {
                badgeElement.style.animation = '';
            }, 500);

        } catch (error) {
            console.error('Failed to update status:', error);
            badgeElement.innerHTML = originalHTML;
            this.showError('Failed to update status');
        }
    }

    /**
     * Update task priority
     */
    async updateTaskPriority(taskId, newPriority, badgeElement) {
        const originalHTML = badgeElement.innerHTML;
        badgeElement.innerHTML = '<span style="opacity: 0.5;">Updating...</span>';

        try {
            await api.updateTaskPriority(taskId, newPriority);
            
            // Update badge display
            badgeElement.innerHTML = Formatters.priorityBadge(newPriority);
            
            // Re-attach editor
            this.makePriorityEditable(badgeElement, taskId, newPriority);

            // Success animation
            badgeElement.style.animation = 'highlight 0.5s';
            setTimeout(() => {
                badgeElement.style.animation = '';
            }, 500);

        } catch (error) {
            console.error('Failed to update priority:', error);
            badgeElement.innerHTML = originalHTML;
            this.showError('Failed to update priority');
        }
    }

    /**
     * Update task complexity
     */
    async updateTaskComplexity(taskId, newComplexity, indicatorElement) {
        const originalHTML = indicatorElement.innerHTML;
        indicatorElement.innerHTML = '<span style="opacity: 0.5;">Updating...</span>';

        try {
            await api.updateTaskComplexity(taskId, newComplexity);
            
            // Update indicator display
            indicatorElement.innerHTML = Formatters.complexityIndicator(newComplexity);
            
            // Re-attach editor
            this.makeComplexityEditable(indicatorElement, taskId, newComplexity);

            // Success animation
            indicatorElement.style.animation = 'highlight 0.5s';
            setTimeout(() => {
                indicatorElement.style.animation = '';
            }, 500);

        } catch (error) {
            console.error('Failed to update complexity:', error);
            indicatorElement.innerHTML = originalHTML;
            this.showError('Failed to update complexity');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Create global instance
const taskEditor = new TaskEditor();
