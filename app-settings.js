// Settings App Module

const SettingsApp = {
    name: 'settings',
    title: 'Settings',
    processId: null,
    windowId: null,
    currentWallpaper: 1,

    getContent() {
        return `
            <div class="app-section">
                <div class="section-title">Wallpaper</div>
                
                <div class="wallpaper-grid">
                    <div class="wallpaper-option wallpaper-1 active" data-wallpaper="1"></div>
                    <div class="wallpaper-option wallpaper-2" data-wallpaper="2"></div>
                    <div class="wallpaper-option wallpaper-3" data-wallpaper="3"></div>
                    <div class="wallpaper-option wallpaper-4" data-wallpaper="4"></div>
                </div>
            </div>
            
            <div class="app-section" style="margin-top: 24px;">
                <div class="section-title">About</div>
                <div style="background: var(--bg-surface); padding: 16px; border-radius: 8px; font-size: 0.85rem; line-height: 1.8;">
                    <p><strong>OS Simulator</strong></p>
                    <p>Version 1.0</p>
                    <p style="margin-top: 12px; color: var(--text-dim);">
                        A demonstration of operating system concepts including:
                    </p>
                    <ul style="margin: 8px 0 0 20px; color: var(--text-dim);">
                        <li>Multithreading with Web Workers</li>
                        <li>Round Robin CPU Scheduling</li>
                        <li>Process Management</li>
                        <li>Window Management</li>
                    </ul>
                </div>
            </div>
        `;
    },

    init(windowId, processId) {
        this.windowId = windowId;
        this.processId = processId;
        
        // Load saved wallpaper
        const saved = localStorage.getItem('wallpaper');
        if (saved) {
            this.currentWallpaper = parseInt(saved);
            this.applyWallpaper(this.currentWallpaper);
        }
        
        // Setup wallpaper click handlers
        document.querySelectorAll('.wallpaper-option').forEach(option => {
            option.addEventListener('click', () => {
                const wallpaperId = parseInt(option.dataset.wallpaper);
                this.setWallpaper(wallpaperId);
            });
        });
        
        // Set active wallpaper
        this.updateActiveWallpaper();
    },

    setWallpaper(id) {
        this.currentWallpaper = id;
        this.applyWallpaper(id);
        this.updateActiveWallpaper();
        localStorage.setItem('wallpaper', id);
    },

    applyWallpaper(id) {
        const desktop = document.getElementById('desktop');
        desktop.style.background = `var(--wallpaper-${id})`;
    },

    updateActiveWallpaper() {
        document.querySelectorAll('.wallpaper-option').forEach(option => {
            option.classList.toggle('active', 
                parseInt(option.dataset.wallpaper) === this.currentWallpaper
            );
        });
    },

    cleanup() {
        // Nothing to cleanup
    }
};

window.SettingsApp = SettingsApp;
