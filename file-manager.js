// File Manager Component
// Manages device file system browsing and operations

class FileManager {
    constructor(adbProtocol, logCallback) {
        this.adb = adbProtocol;
        this.log = logCallback;
        this.currentPath = '/sdcard';
        this.history = ['/sdcard'];
        this.historyIndex = 0;
        this.clipboard = null;
        this.clipboardOperation = null; // 'copy' or 'cut'
    }

    // Initialize file manager UI
    initializeUI() {
        this.createFileManagerHTML();
        this.attachEventListeners();
        this.refreshFileList();
    }

    // Create file manager HTML structure
    createFileManagerHTML() {
        const container = document.getElementById('file-manager-content');
        if (!container) return;

        container.innerHTML = `
            <div class="file-manager">
                <div class="file-toolbar">
                    <button id="fm-back" class="btn btn-small" title="Back">
                        <span>←</span>
                    </button>
                    <button id="fm-forward" class="btn btn-small" title="Forward">
                        <span>→</span>
                    </button>
                    <button id="fm-up" class="btn btn-small" title="Parent Directory">
                        <span>↑</span>
                    </button>
                    <button id="fm-refresh" class="btn btn-small" title="Refresh">
                        <span>⟳</span>
                    </button>
                    <div class="path-breadcrumb" id="fm-breadcrumb"></div>
                    <button id="fm-new-folder" class="btn btn-small btn-primary">New Folder</button>
                    <button id="fm-upload" class="btn btn-small btn-primary">Upload File</button>
                    <input type="file" id="fm-upload-input" style="display:none" multiple>
                </div>

                <div class="file-list-container">
                    <div class="file-list-header">
                        <div class="file-col-name">Name</div>
                        <div class="file-col-size">Size</div>
                        <div class="file-col-date">Date</div>
                        <div class="file-col-perms">Permissions</div>
                        <div class="file-col-actions">Actions</div>
                    </div>
                    <div class="file-list" id="fm-file-list">
                        <div class="loading">Loading files...</div>
                    </div>
                </div>

                <div class="file-status-bar">
                    <span id="fm-selection-info">0 items selected</span>
                    <span id="fm-total-info"></span>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('fm-back')?.addEventListener('click', () => this.navigateBack());
        document.getElementById('fm-forward')?.addEventListener('click', () => this.navigateForward());
        document.getElementById('fm-up')?.addEventListener('click', () => this.navigateUp());
        document.getElementById('fm-refresh')?.addEventListener('click', () => this.refreshFileList());
        document.getElementById('fm-new-folder')?.addEventListener('click', () => this.createNewFolder());
        document.getElementById('fm-upload')?.addEventListener('click', () => {
            document.getElementById('fm-upload-input')?.click();
        });
        document.getElementById('fm-upload-input')?.addEventListener('change', (e) => this.uploadFiles(e.target.files));
    }

    // Navigate to path
    async navigateTo(path) {
        this.currentPath = path;

        // Update history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(path);
        this.historyIndex = this.history.length - 1;

        await this.refreshFileList();
        this.updateBreadcrumb();
    }

    // Navigate back in history
    async navigateBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            await this.refreshFileList();
            this.updateBreadcrumb();
        }
    }

    // Navigate forward in history
    async navigateForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            await this.refreshFileList();
            this.updateBreadcrumb();
        }
    }

    // Navigate to parent directory
    async navigateUp() {
        if (this.currentPath === '/') return;

        const parentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
        await this.navigateTo(parentPath);
    }

    // Update breadcrumb navigation
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('fm-breadcrumb');
        if (!breadcrumb) return;

        const parts = this.currentPath.split('/').filter(p => p);
        let html = '<span class="breadcrumb-item" data-path="/">Root</span>';

        let path = '';
        for (const part of parts) {
            path += '/' + part;
            html += ` / <span class="breadcrumb-item" data-path="${path}">${part}</span>`;
        }

        breadcrumb.innerHTML = html;

        // Add click handlers
        breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.path);
            });
        });
    }

    // Refresh file list
    async refreshFileList() {
        const fileList = document.getElementById('fm-file-list');
        if (!fileList) return;

        fileList.innerHTML = '<div class="loading">Loading files...</div>';

        try {
            const files = await this.adb.ls(this.currentPath);
            this.renderFileList(files);
            this.updateStatusBar(files);
        } catch (error) {
            fileList.innerHTML = `<div class="error">Error loading files: ${error.message}</div>`;
            this.log(`File list error: ${error.message}`, 'error');
        }
    }

    // Render file list
    renderFileList(files) {
        const fileList = document.getElementById('fm-file-list');
        if (!fileList) return;

        if (files.length === 0) {
            fileList.innerHTML = '<div class="empty">Directory is empty</div>';
            return;
        }

        // Sort: directories first, then files
        files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });

        let html = '';
        for (const file of files) {
            if (file.name === '.' || file.name === '..') continue;

            const icon = this.getFileIcon(file);
            const size = file.isDirectory ? '-' : this.formatFileSize(file.size);

            html += `
                <div class="file-item ${file.isDirectory ? 'directory' : 'file'}"
                     data-name="${file.name}"
                     data-path="${this.currentPath}/${file.name}">
                    <div class="file-col-name">
                        <span class="file-icon">${icon}</span>
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                    </div>
                    <div class="file-col-size">${size}</div>
                    <div class="file-col-date">${file.date}</div>
                    <div class="file-col-perms">${file.permissions}</div>
                    <div class="file-col-actions">
                        <button class="btn-icon" data-action="download" title="Download">⬇</button>
                        <button class="btn-icon" data-action="rename" title="Rename">✎</button>
                        <button class="btn-icon" data-action="delete" title="Delete">🗑</button>
                    </div>
                </div>
            `;
        }

        fileList.innerHTML = html;

        // Attach click handlers
        fileList.querySelectorAll('.file-item').forEach(item => {
            const name = item.dataset.name;
            const path = item.dataset.path;
            const file = files.find(f => f.name === name);

            // Double-click to open
            item.addEventListener('dblclick', () => {
                if (file.isDirectory) {
                    this.navigateTo(path);
                } else {
                    this.openFile(path, file);
                }
            });

            // Action buttons
            item.querySelectorAll('.btn-icon').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    this.performFileAction(action, path, file);
                });
            });
        });
    }

    // Get icon for file type
    getFileIcon(file) {
        if (file.isDirectory) return '📁';
        if (file.isSymlink) return '🔗';

        const ext = file.name.split('.').pop().toLowerCase();
        const iconMap = {
            'apk': '📦',
            'zip': '🗜',
            'jpg': '🖼',
            'jpeg': '🖼',
            'png': '🖼',
            'gif': '🖼',
            'mp4': '🎥',
            'mp3': '🎵',
            'pdf': '📄',
            'txt': '📝',
            'log': '📋',
            'xml': '📰',
            'json': '📊'
        };

        return iconMap[ext] || '📄';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update status bar
    updateStatusBar(files) {
        const totalInfo = document.getElementById('fm-total-info');
        if (!totalInfo) return;

        const fileCount = files.filter(f => !f.isDirectory).length;
        const dirCount = files.filter(f => f.isDirectory).length;
        const totalSize = files.filter(f => !f.isDirectory).reduce((sum, f) => sum + f.size, 0);

        totalInfo.textContent = `${dirCount} folders, ${fileCount} files (${this.formatFileSize(totalSize)})`;
    }

    // Perform file action
    async performFileAction(action, path, file) {
        switch (action) {
            case 'download':
                await this.downloadFile(path, file);
                break;
            case 'rename':
                await this.renameFile(path, file);
                break;
            case 'delete':
                await this.deleteFile(path, file);
                break;
        }
    }

    // Download file from device
    async downloadFile(path, file) {
        try {
            this.log(`Downloading ${file.name}...`, 'info');
            // TODO: Implement ADB pull
            this.log('Download functionality requires ADB pull implementation', 'warning');
        } catch (error) {
            this.log(`Download error: ${error.message}`, 'error');
        }
    }

    // Rename file
    async renameFile(path, file) {
        const newName = prompt('Enter new name:', file.name);
        if (!newName || newName === file.name) return;

        try {
            const newPath = this.currentPath + '/' + newName;
            await this.adb.shell(`mv "${path}" "${newPath}"`);
            this.log(`Renamed ${file.name} to ${newName}`, 'success');
            await this.refreshFileList();
        } catch (error) {
            this.log(`Rename error: ${error.message}`, 'error');
        }
    }

    // Delete file
    async deleteFile(path, file) {
        if (!confirm(`Delete ${file.name}?`)) return;

        try {
            const command = file.isDirectory ? `rm -rf "${path}"` : `rm "${path}"`;
            await this.adb.shell(command);
            this.log(`Deleted ${file.name}`, 'success');
            await this.refreshFileList();
        } catch (error) {
            this.log(`Delete error: ${error.message}`, 'error');
        }
    }

    // Create new folder
    async createNewFolder() {
        const name = prompt('Enter folder name:');
        if (!name) return;

        try {
            const newPath = this.currentPath + '/' + name;
            await this.adb.shell(`mkdir -p "${newPath}"`);
            this.log(`Created folder ${name}`, 'success');
            await this.refreshFileList();
        } catch (error) {
            this.log(`Create folder error: ${error.message}`, 'error');
        }
    }

    // Upload files to device
    async uploadFiles(files) {
        if (!files || files.length === 0) return;

        for (const file of files) {
            try {
                this.log(`Uploading ${file.name}...`, 'info');
                // TODO: Implement ADB push
                this.log('Upload functionality requires ADB push implementation', 'warning');
            } catch (error) {
                this.log(`Upload error for ${file.name}: ${error.message}`, 'error');
            }
        }
    }

    // Open file (preview or download)
    async openFile(path, file) {
        // For text files, could show preview
        // For other files, download
        await this.downloadFile(path, file);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileManager;
}
