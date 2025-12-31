// OS Core - Window Management and System Functions

class OperatingSystem {
    constructor() {
        this.windows = new Map();
        this.processes = new Map();
        this.zIndexCounter = 100;
        this.nextWindowId = 1;
        this.nextProcessId = 1;
        this.activeWindow = null;
    }

    // Window Management
    createWindow(appName, title, content) {
        const windowId = `window-${this.nextWindowId++}`;
        const processId = this.nextProcessId++;
        
        const template = document.getElementById('windowTemplate');
        const windowEl = template.content.cloneNode(true).querySelector('.window');
        
        // Set window properties
        windowEl.dataset.windowId = windowId;
        windowEl.dataset.appName = appName;
        windowEl.querySelector('.window-title').textContent = title;
        windowEl.querySelector('.window-content').innerHTML = content;
        
        // Position window (cascade style)
        const offset = (this.windows.size * 30) % 100;
        windowEl.style.top = `${100 + offset}px`;
        windowEl.style.left = `${100 + offset}px`;
        windowEl.style.width = '700px';
        windowEl.style.height = '500px';
        windowEl.style.zIndex = this.zIndexCounter++;
        
        // Add to DOM
        document.getElementById('windowsContainer').appendChild(windowEl);
        
        // Setup window controls
        this.setupWindowControls(windowEl, windowId);
        this.setupWindowDrag(windowEl);
        this.setupWindowResize(windowEl);
        
        // Store window info
        this.windows.set(windowId, {
            element: windowEl,
            appName,
            title,
            processId,
            minimized: false,
            maximized: false
        });
        
        // Add to taskbar
        this.addToTaskbar(windowId, appName, title);
        
        // Focus window
        this.focusWindow(windowId);
        
        // Register process
        this.registerProcess(processId, appName, 'running');
        
        return { windowId, processId };
    }

    setupWindowControls(windowEl, windowId) {
        const closeBtn = windowEl.querySelector('.close-btn');
        const minimizeBtn = windowEl.querySelector('.minimize-btn');
        const maximizeBtn = windowEl.querySelector('.maximize-btn');
        
        closeBtn.addEventListener('click', () => this.closeWindow(windowId));
        minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowId));
        maximizeBtn.addEventListener('click', () => this.toggleMaximize(windowId));
    }

    setupWindowDrag(windowEl) {
        const titlebar = windowEl.querySelector('.window-titlebar');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (windowEl.classList.contains('maximized')) return;
            
            isDragging = true;
            initialX = e.clientX - windowEl.offsetLeft;
            initialY = e.clientY - windowEl.offsetTop;
            
            this.focusWindow(windowEl.dataset.windowId);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            windowEl.style.left = currentX + 'px';
            windowEl.style.top = Math.max(0, currentY) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupWindowResize(windowEl) {
        // Simple resize from corners (simplified version)
        // Full implementation would add resize handles
    }

    closeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;
        
        window.element.remove();
        this.removeFromTaskbar(windowId);
        this.unregisterProcess(window.processId);
        this.windows.delete(windowId);
        
        // Focus next window
        if (this.windows.size > 0) {
            const nextWindow = Array.from(this.windows.keys())[0];
            this.focusWindow(nextWindow);
        }
    }

    minimizeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;
        
        window.element.classList.add('minimized');
        window.minimized = true;
        this.updateTaskbarApp(windowId, false);
    }

    restoreWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;
        
        window.element.classList.remove('minimized');
        window.minimized = false;
        this.focusWindow(windowId);
        this.updateTaskbarApp(windowId, true);
    }

    toggleMaximize(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;
        
        if (window.maximized) {
            window.element.classList.remove('maximized');
            window.maximized = false;
        } else {
            window.element.classList.add('maximized');
            window.maximized = true;
        }
    }

    focusWindow(windowId) {
        // Remove focus from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.style.zIndex = parseInt(w.style.zIndex) - 1;
        });
        
        const window = this.windows.get(windowId);
        if (window) {
            window.element.style.zIndex = this.zIndexCounter++;
            this.activeWindow = windowId;
        }
    }

    // Taskbar Management
    addToTaskbar(windowId, appName, title) {
        const taskbarApps = document.getElementById('taskbarApps');
        
        const appBtn = document.createElement('div');
        appBtn.className = 'taskbar-app active';
        appBtn.dataset.windowId = windowId;
        appBtn.textContent = title;
        
        appBtn.addEventListener('click', () => {
            const window = this.windows.get(windowId);
            if (window.minimized) {
                this.restoreWindow(windowId);
            } else {
                this.focusWindow(windowId);
            }
        });
        
        taskbarApps.appendChild(appBtn);
    }

    removeFromTaskbar(windowId) {
        const appBtn = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
        if (appBtn) appBtn.remove();
    }

    updateTaskbarApp(windowId, active) {
        const appBtn = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
        if (appBtn) {
            appBtn.classList.toggle('active', active);
        }
    }

    // Process Management
    registerProcess(processId, name, status = 'running') {
        this.processes.set(processId, {
            id: processId,
            name,
            status,
            startTime: Date.now()
        });
        this.updateProcessCount();
    }

    unregisterProcess(processId) {
        this.processes.delete(processId);
        this.updateProcessCount();
    }

    updateProcessStatus(processId, status) {
        const process = this.processes.get(processId);
        if (process) {
            process.status = status;
        }
    }

    getProcesses() {
        return Array.from(this.processes.values());
    }

    updateProcessCount() {
        document.getElementById('processCount').textContent = this.processes.size;
    }

    // Utility
    getWindow(windowId) {
        return this.windows.get(windowId);
    }

    getAllWindows() {
        return Array.from(this.windows.values());
    }
}

// Create global OS instance
window.OS = new OperatingSystem();
