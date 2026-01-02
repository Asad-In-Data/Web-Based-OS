// Task Manager App Module

const TaskManagerApp = {
    name: 'taskmanager',
    title: 'Task Manager',
    processId: null,
    windowId: null,
    updateInterval: null,

    getContent() {
        return `
            <div class="app-section">
                <div class="section-title">Running Processes</div>
                
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>Process ID</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Runtime</th>
                        </tr>
                    </thead>
                    <tbody id="task-table-body">
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--text-dim);">No processes running</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },

    init(windowId, processId) {
        this.windowId = windowId;
        this.processId = processId;
        
        // Update process list every second
        this.updateInterval = setInterval(() => {
            this.updateProcessList();
        }, 1000);
        
        // Initial update
        this.updateProcessList();
    },

    updateProcessList() {
        const tbody = document.getElementById('task-table-body');
        const processes = window.OS.getProcesses();
        
        if (processes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-dim);">No processes running</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = processes.map(proc => {
            const runtime = Math.floor((Date.now() - proc.startTime) / 1000);
            const statusClass = proc.status === 'running' ? 'running' : 'idle';
            
            return `
                <tr>
                    <td>
                        <span class="status-dot ${statusClass}"></span>
                        ${proc.id}
                    </td>
                    <td>${proc.name}</td>
                    <td>${proc.status}</td>
                    <td>${runtime}s</td>
                </tr>
            `;
        }).join('');
    },

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
};

window.TaskManagerApp = TaskManagerApp;
