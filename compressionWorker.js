// Web Worker for file compression
// This simulates compression by processing file chunks

self.onmessage = async function(e) {
    const { fileData, fileName, workerId } = e.data;
    
    try {
        // Simulate compression process
        const totalSize = fileData.byteLength;
        const chunkSize = Math.ceil(totalSize / 20); // Process in 20 chunks
        let processedSize = 0;
        
        self.postMessage({
            type: 'status',
            workerId,
            status: 'Processing',
            fileName
        });
        
        // Simulate compression by processing in chunks
        for (let i = 0; i < totalSize; i += chunkSize) {
            const chunk = fileData.slice(i, Math.min(i + chunkSize, totalSize));
            
            // Simulate compression work (CPU intensive)
            await simulateCompression(chunk);
            
            processedSize += chunk.byteLength;
            const progress = (processedSize / totalSize) * 100;
            
            // Send progress update
            self.postMessage({
                type: 'progress',
                workerId,
                progress: Math.min(progress, 100),
                processedSize,
                totalSize
            });
        }
        
        // Simulate final compressed data
        const compressionRatio = 0.6 + Math.random() * 0.2; // 60-80% of original
        const compressedSize = Math.floor(totalSize * compressionRatio);
        
        self.postMessage({
            type: 'complete',
            workerId,
            fileName,
            originalSize: totalSize,
            compressedSize,
            compressionRatio: ((1 - compressionRatio) * 100).toFixed(2)
        });
        
    } catch (error) {
        self.postMessage({
            type: 'error',
            workerId,
            error: error.message
        });
    }
};

// Simulate CPU-intensive compression work
function simulateCompression(chunk) {
    return new Promise(resolve => {
        // Simulate work with a delay proportional to chunk size
        const delay = Math.min(100, chunk.byteLength / 10000);
        
        // Do some actual CPU work (not just waiting)
        let sum = 0;
        const iterations = Math.min(100000, chunk.byteLength * 10);
        for (let i = 0; i < iterations; i++) {
            sum += Math.sqrt(i) * Math.sin(i);
        }
        
        setTimeout(resolve, delay);
    });
}
