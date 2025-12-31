// Main OS Initialization

// App registry
const APPS = {
    compressor: CompressorApp,
    scheduler: SchedulerApp,
    taskmanager: TaskManagerApp,
    settings: SettingsApp
};

// Start Menu
const startBtn = document.getElementById('startBtn');
const startMenu = document.getElementById('startMenu');

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('show');
});

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.remove('show');
    }
});

// Launch app from start menu
document.querySelectorAll('.start-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.dataset.app;
        launchApp(appName);
        startMenu.classList.remove('show');
    });
});

// Launch app from desktop icon
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const appName = icon.dataset.app;
        launchApp(appName);
    });
});

// Launch app function
function launchApp(appName) {
    const app = APPS[appName];
    if (!app) return;
    
    // Check if app is already running
    const existingWindow = Array.from(window.OS.windows.values())
        .find(w => w.appName === appName);
    
    if (existingWindow) {
        // Focus existing window
        if (existingWindow.minimized) {
            window.OS.restoreWindow(existingWindow.element.dataset.windowId);
        } else {
            window.OS.focusWindow(existingWindow.element.dataset.windowId);
        }
        return;
    }
    
    // Create new window
    const content = app.getContent();
    const { windowId, processId } = window.OS.createWindow(appName, app.title, content);
    
    // Initialize app
    setTimeout(() => {
        app.init(windowId, processId);
    }, 100);
}

// Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clockTray').textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);

// Load saved wallpaper on startup
const savedWallpaper = localStorage.getItem('wallpaper');
const savedCustomWallpaper = localStorage.getItem('customWallpaper');

if (savedWallpaper) {
    const desktop = document.getElementById('desktop');
    
    if (savedWallpaper === 'custom' && savedCustomWallpaper) {
        desktop.style.background = `url(${savedCustomWallpaper})`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
    } else if (savedWallpaper !== 'custom') {
        desktop.style.background = `var(--wallpaper-${savedWallpaper})`;
    }
}

// Welcome message
console.log('%cOS Simulator Loaded', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('Double-click desktop icons or use the start menu to launch apps');