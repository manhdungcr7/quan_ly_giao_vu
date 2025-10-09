const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TeachingImportService {
    constructor() {
        this.jobs = new Map();
    }

    createJob(filePath, originalName, columns, rowCount) {
        const jobId = uuidv4();
        this.jobs.set(jobId, {
            id: jobId,
            filePath,
            originalName,
            columns,
            rowCount,
            createdAt: Date.now()
        });
        return jobId;
    }

    getJob(jobId) {
        return this.jobs.get(jobId) || null;
    }

    removeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        try {
            if (job.filePath && fs.existsSync(job.filePath)) {
                fs.unlinkSync(job.filePath);
            }
        } catch (error) {
            console.error('Failed to cleanup import file:', error);
        }

        this.jobs.delete(jobId);
    }

    cleanupExpiredJobs(ttlMs = 30 * 60 * 1000) {
        const now = Date.now();
        for (const [jobId, job] of this.jobs.entries()) {
            if (now - job.createdAt > ttlMs) {
                this.removeJob(jobId);
            }
        }
    }
}

module.exports = new TeachingImportService();
