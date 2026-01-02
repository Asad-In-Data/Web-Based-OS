// Scheduler App Module

const SchedulerApp = {
    name: 'scheduler',
    title: 'Round Robin Scheduler',
    processId: null,
    windowId: null,
    isRunning: false,
    process1: { count: 0, target: 1000, time: 0 },
    process2: { count: 1000, target: 2000, time: 0 },
    currentProcess: 1,
    TIME_QUANTUM: 500,

    getContent() {
        return `
            <div class="app-section">
                <div class="section-title">Round Robin CPU Scheduling</div>
                
                <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span><strong>Time Quantum:</strong> 500ms</span>
                        <span><strong>Processes:</strong> 2</span>
                    </div>
                </div>
                
                <button class="btn" id="sched-start-btn">Start Scheduling</button>
                
                <div class="process-list">
                    <div class="process-item" id="sched-proc1">
                        <div class="process-header">
                            <span class="process-id">Process 1</span>
                            <span class="process-badge" id="sched-badge1">Ready</span>
                        </div>
                        <div class="counter" id="sched-count1">0</div>
                        <div style="text-align: center; color: var(--text-dim); margin-bottom: 12px;">Range: 0 → 1000</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="sched-prog1"></div>
                        </div>
                        <div style="text-align: center; font-size: 0.8rem; color: var(--text-dim); margin-top: 8px;" id="sched-time1">Execution: 0ms</div>
                    </div>
                    
                    <div class="process-item" id="sched-proc2">
                        <div class="process-header">
                            <span class="process-id">Process 2</span>
                            <span class="process-badge" id="sched-badge2">Ready</span>
                        </div>
                        <div class="counter" id="sched-count2">1000</div>
                        <div style="text-align: center; color: var(--text-dim); margin-bottom: 12px;">Range: 1000 → 2000</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="sched-prog2"></div>
                        </div>
                        <div style="text-align: center; font-size: 0.8rem; color: var(--text-dim); margin-top: 8px;" id="sched-time2">Execution: 0ms</div>
                    </div>
                </div>
                
                <div class="timeline-section">
                    <div class="timeline-label">Execution Timeline</div>
                    <div class="timeline-track" id="sched-timeline"></div>
                </div>
            </div>
        `;
    },

    init(windowId, processId) {
        this.windowId = windowId;
        this.processId = processId;
        
        document.getElementById('sched-start-btn').addEventListener('click', () => {
            this.start();
        });
    },

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.process1 = { count: 0, target: 1000, time: 0 };
        this.process2 = { count: 1000, target: 2000, time: 0 };
        this.currentProcess = 1;
        
        // Reset UI
        document.getElementById('sched-count1').textContent = '0';
        document.getElementById('sched-count2').textContent = '1000';
        document.getElementById('sched-prog1').style.width = '0%';
        document.getElementById('sched-prog2').style.width = '0%';
        document.getElementById('sched-time1').textContent = 'Execution: 0ms';
        document.getElementById('sched-time2').textContent = 'Execution: 0ms';
        document.getElementById('sched-timeline').innerHTML = '';
        document.getElementById('sched-proc1').classList.remove('running');
        document.getElementById('sched-proc2').classList.remove('running');
        document.getElementById('sched-start-btn').disabled = true;
        
        this.updateStatus(1, 'running');
        this.updateStatus(2, 'waiting');
        
        await this.executeScheduling();
        
        this.updateStatus(1, 'completed');
        this.updateStatus(2, 'completed');
        document.getElementById('sched-proc1').classList.remove('running');
        document.getElementById('sched-proc2').classList.remove('running');
        
        this.isRunning = false;
        document.getElementById('sched-start-btn').disabled = false;
    },

    async executeScheduling() {
        while (this.process1.count < this.process1.target || this.process2.count < this.process2.target) {
            
            if (this.currentProcess === 1 && this.process1.count < this.process1.target) {
                document.getElementById('sched-proc1').classList.add('running');
                document.getElementById('sched-proc2').classList.remove('running');
                this.updateStatus(1, 'running');
                this.updateStatus(2, 'waiting');
                
                await this.executeProcess(this.process1, 1);
                this.addTimelineBlock(1);
                
            } else if (this.currentProcess === 2 && this.process2.count < this.process2.target) {
                document.getElementById('sched-proc2').classList.add('running');
                document.getElementById('sched-proc1').classList.remove('running');
                this.updateStatus(2, 'running');
                this.updateStatus(1, 'waiting');
                
                await this.executeProcess(this.process2, 2);
                this.addTimelineBlock(2);
            }
            
            this.currentProcess = this.currentProcess === 1 ? 2 : 1;
            await this.sleep(50);
        }
    },

    async executeProcess(process, num) {
        const startTime = Date.now();
        const endTime = startTime + this.TIME_QUANTUM;
        
        while (Date.now() < endTime && process.count < process.target) {
            process.count++;
            
            if (process.count % 10 === 0) {
                document.getElementById(`sched-count${num}`).textContent = process.count;
                const progress = ((process.count - (num === 1 ? 0 : 1000)) / 1000) * 100;
                document.getElementById(`sched-prog${num}`).style.width = progress + '%';
                await this.sleep(1);
            }
        }
        
        const execTime = Date.now() - startTime;
        process.time += execTime;
        document.getElementById(`sched-time${num}`).textContent = `Execution: ${process.time}ms`;
        
        // Final update
        document.getElementById(`sched-count${num}`).textContent = process.count;
        const progress = ((process.count - (num === 1 ? 0 : 1000)) / 1000) * 100;
        document.getElementById(`sched-prog${num}`).style.width = progress + '%';
    },

    updateStatus(num, status) {
        const badge = document.getElementById(`sched-badge${num}`);
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        badge.className = 'process-badge ' + status;
    },

    addTimelineBlock(num) {
        const timeline = document.getElementById('sched-timeline');
        const block = document.createElement('div');
        block.className = `timeline-block p${num}`;
        block.textContent = `P${num}`;
        timeline.appendChild(block);
        timeline.scrollLeft = timeline.scrollWidth;
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    cleanup() {
        this.isRunning = false;
    }
};

window.SchedulerApp = SchedulerApp;
