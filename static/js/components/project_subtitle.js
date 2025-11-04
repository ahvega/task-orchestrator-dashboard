/**
 * Project Subtitle Component
 * Shows current project name below navigation tabs
 */

class ProjectSubtitle {
    constructor(containerId = 'project-subtitle') {
        this.containerId = containerId;
        this.container = null;
    }

    /**
     * Initialize the subtitle component
     */
    init() {
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            console.warn(`Container #${this.containerId} not found`);
            return;
        }

        // Subscribe to project changes
        if (window.appState) {
            window.appState.subscribe((state) => {
                this.update(state.projectName);
            });

            // Initial update
            this.update(window.appState.getProjectName());
        }

        // Add click handler to project name
        this.setupClickHandler();

        console.log('ProjectSubtitle initialized');
    }

    /**
     * Update the displayed project name
     */
    update(projectName) {
        if (!this.container) return;

        const nameSpan = this.container.querySelector('.project-name');
        if (nameSpan) {
            nameSpan.textContent = projectName || 'All Projects';
        }
    }

    /**
     * Setup click handler to open project selector
     */
    setupClickHandler() {
        const nameSpan = this.container.querySelector('.project-name');
        if (nameSpan && window.projectSelector) {
            nameSpan.style.cursor = 'pointer';
            nameSpan.addEventListener('click', () => {
                window.projectSelector.open();
            });
        }
    }
}

// Create global instance (initialized in main.js)
let projectSubtitle = null;
