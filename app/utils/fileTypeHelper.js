/**
 * File Type Helper
 * Utility functions for determining file types and icons
 */

/**
 * Get file type category from MIME type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - Category: 'pdf', 'word', 'excel', 'image', 'archive', 'text', or 'other'
 */
function getFileTypeCategory(mimeType) {
    if (!mimeType) return 'other';
    
    const mime = mimeType.toLowerCase();
    
    if (mime === 'application/pdf') return 'pdf';
    
    if (mime === 'application/msword' || 
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'word';
    }
    
    if (mime === 'application/vnd.ms-excel' || 
        mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return 'excel';
    }
    
    if (mime.startsWith('image/')) return 'image';
    
    if (mime === 'application/x-rar-compressed' || 
        mime === 'application/zip' || 
        mime === 'application/x-zip-compressed' ||
        mime === 'application/x-7z-compressed') {
        return 'archive';
    }
    
    if (mime === 'text/plain') return 'text';
    
    return 'other';
}

/**
 * Get FontAwesome icon class for file type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - FontAwesome class name
 */
function getFileIcon(mimeType) {
    const category = getFileTypeCategory(mimeType);
    
    const icons = {
        pdf: 'fa-file-pdf',
        word: 'fa-file-word',
        excel: 'fa-file-excel',
        image: 'fa-file-image',
        archive: 'fa-file-archive',
        text: 'fa-file-alt',
        other: 'fa-file'
    };
    
    return icons[category] || 'fa-file';
}

/**
 * Check if file type is previewable
 * @param {string} mimeType - The MIME type of the file
 * @returns {boolean}
 */
function isPreviewable(mimeType) {
    const previewableTypes = [
        'application/pdf',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return previewableTypes.includes(mimeType);
}

/**
 * Get human-readable file type name
 * @param {string} mimeType - The MIME type of the file
 * @returns {string}
 */
function getFileTypeName(mimeType) {
    const category = getFileTypeCategory(mimeType);
    
    const names = {
        pdf: 'Tài liệu PDF',
        word: 'Tài liệu Word',
        excel: 'Bảng tính Excel',
        image: 'Hình ảnh',
        archive: 'File nén',
        text: 'Văn bản thuần',
        other: 'File khác'
    };
    
    return names[category] || 'File';
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
    getFileTypeCategory,
    getFileIcon,
    isPreviewable,
    getFileTypeName,
    formatFileSize
};
