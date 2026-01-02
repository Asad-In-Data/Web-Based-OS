// Compressor App Module

const CompressorApp = {
    name: 'compressor',
    title: 'File Compressor',
    processId: null,
    windowId: null,
    workers: { 1: null, 2: null },
    files: { 1: null, 2: null },
    compressedBlobs: { 1: null, 2: null },

    getContent() {
        return `
            <div class="app-section">
                <div class="section-title">Parallel File Compression</div>
                
                <div class="upload-grid">
                    <div class="upload-zone" id="comp-zone1">
                        <input type="file" id="comp-file1" hidden>
                        <label for="comp-file1" style="cursor: pointer; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span class="label">File 1</span>
                            <span class="filename" id="comp-name1"></span>
                        </label>
                    </div>
                    
                    <div class="upload-zone" id="comp-zone2">
                        <input type="file" id="comp-file2" hidden>
                        <label for="comp-file2" style="cursor: pointer; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span class="label">File 2</span>
                            <span class="filename" id="comp-name2"></span>
                        </label>
                    </div>
                </div>
                
                <button class="btn" id="comp-start-btn" disabled>Start Compression</button>
                
                <div class="worker-list">
                    <div class="worker-item">
                        <div class="worker-header">
                            <span class="worker-title">Worker Thread 1</span>
                            <span class="worker-status" id="comp-status1">Idle</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="comp-prog1"></div>
                        </div>
                        <div class="worker-info" id="comp-info1"></div>
                        <button class="download-btn" id="comp-download1">Download</button>
                    </div>
                    
                    <div class="worker-item">
                        <div class="worker-header">
                            <span class="worker-title">Worker Thread 2</span>
                            <span class="worker-status" id="comp-status2">Idle</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="comp-prog2"></div>
                        </div>
                        <div class="worker-info" id="comp-info2"></div>
                        <button class="download-btn" id="comp-download2">Download</button>
                    </div>
                </div>
            </div>
        `;
    },

    init(windowId, processId) {
        this.windowId = windowId;
        this.processId = processId;
        
        // Setup file inputs
        document.getElementById('comp-file1').addEventListener('change', (e) => {
            this.files[1] = e.target.files[0];
            this.updateFileInfo(1);
        });
        
        document.getElementById('comp-file2').addEventListener('change', (e) => {
            this.files[2] = e.target.files[0];
            this.updateFileInfo(2);
        });
        
        // Setup start button
        document.getElementById('comp-start-btn').addEventListener('click', () => {
            this.startCompression();
        });
        
        // Setup download buttons
        document.getElementById('comp-download1').addEventListener('click', () => this.download(1));
        document.getElementById('comp-download2').addEventListener('click', () => this.download(2));
    },

    updateFileInfo(num) {
        const file = this.files[num];
        if (file) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            document.getElementById(`comp-name${num}`).textContent = `${file.name} (${sizeMB}MB)`;
            document.getElementById(`comp-zone${num}`).classList.add('has-file');
        }
        
        // Enable button if both files selected
        const btn = document.getElementById('comp-start-btn');
        btn.disabled = !(this.files[1] && this.files[2]);
    },

    async startCompression() {
        document.getElementById('comp-start-btn').disabled = true;
        
        // Reset UI
        this.resetWorker(1);
        this.resetWorker(2);
        this.compressedBlobs = { 1: null, 2: null };
        
        // Create workers
        this.workers[1] = new Worker('compressionWorker.js');
        this.workers[2] = new Worker('compressionWorker.js');
        
        this.workers[1].onmessage = (e) => this.handleWorkerMessage(1, e.data);
        this.workers[2].onmessage = (e) => this.handleWorkerMessage(2, e.data);
        
        // Read files
        const data1 = await this.readFile(this.files[1]);
        const data2 = await this.readFile(this.files[2]);
        
        // Start compression
        this.workers[1].postMessage({
            fileData: data1,
            fileName: this.files[1].name,
            workerId: 1
        });
        
        this.workers[2].postMessage({
            fileData: data2,
            fileName: this.files[2].name,
            workerId: 2
        });
    },

    readFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsArrayBuffer(file);
        });
    },

    handleWorkerMessage(workerId, data) {
        const statusEl = document.getElementById(`comp-status${workerId}`);
        const progEl = document.getElementById(`comp-prog${workerId}`);
        const infoEl = document.getElementById(`comp-info${workerId}`);
        const downloadBtn = document.getElementById(`comp-download${workerId}`);
        
        switch (data.type) {
            case 'status':
                statusEl.textContent = data.status;
                statusEl.classList.add('active');
                break;
                
            case 'progress':
                progEl.style.width = data.progress + '%';
                const pMB = (data.processedSize / (1024 * 1024)).toFixed(2);
                const tMB = (data.totalSize / (1024 * 1024)).toFixed(2);
                infoEl.textContent = `${pMB}MB / ${tMB}MB (${data.progress.toFixed(1)}%)`;
                break;
                
            case 'complete':
                statusEl.textContent = 'Done';
                statusEl.classList.remove('active');
                progEl.style.width = '100%';
                
                const oMB = (data.originalSize / (1024 * 1024)).toFixed(2);
                const cMB = (data.compressedSize / (1024 * 1024)).toFixed(2);
                infoEl.textContent = `${oMB}MB → ${cMB}MB (Saved ${data.compressionRatio}%)`;
                
                // Create blob for download
                const compData = new ArrayBuffer(data.compressedSize);
                this.compressedBlobs[workerId] = new Blob([compData], { type: 'application/octet-stream' });
                downloadBtn.classList.add('show');
                
                this.workers[workerId].terminate();
                break;
                
            case 'error':
                statusEl.textContent = 'Error';
                infoEl.textContent = data.error;
                break;
        }
    },

    resetWorker(num) {
        document.getElementById(`comp-status${num}`).textContent = 'Idle';
        document.getElementById(`comp-status${num}`).classList.remove('active');
        document.getElementById(`comp-prog${num}`).style.width = '0%';
        document.getElementById(`comp-info${num}`).textContent = '';
        document.getElementById(`comp-download${num}`).classList.remove('show');
    },

    download(num) {
        const blob = this.compressedBlobs[num];
        if (!blob) return;
        
        const filename = `compressed_${this.files[num].name}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    cleanup() {
        if (this.workers[1]) this.workers[1].terminate();
        if (this.workers[2]) this.workers[2].terminate();
    }
};

// Register app
window.CompressorApp = CompressorApp;
