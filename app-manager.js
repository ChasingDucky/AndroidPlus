// Application Manager Component
// Manages installed applications on the device

class AppManager {
    constructor(adbProtocol, logCallback) {
        this.adb = adbProtocol;
        this.log = logCallback;
        this.packages = [];
        this.filteredPackages = [];
        this.selectedPackages = new Set();
        this.currentFilter = 'all'; // 'all', 'system', 'user', 'enabled', 'disabled'
    }

    // Initialize app manager UI
    initializeUI() {
        this.createAppManagerHTML();
        this.attachEventListeners();
        this.loadPackages();
    }

    // Create app manager HTML structure
    createAppManagerHTML() {
        const container = document.getElementById('app-manager-content');
        if (!container) return;

        container.innerHTML = `
            <div class="app-manager">
                <div class="app-toolbar">
                    <div class="filter-group">
                        <label>Filter:</label>
                        <select id="app-filter" class="input-field">
                            <option value="all">All Apps</option>
                            <option value="user">User Apps</option>
                            <option value="system">System Apps</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div class="search-group">
                        <input type="text" id="app-search" class="input-field" placeholder="Search apps...">
                    </div>

                    <button id="app-refresh" class="btn btn-secondary">Refresh</button>
                    <button id="app-install" class="btn btn-primary">Install APK</button>
                    <input type="file" id="app-install-input" accept=".apk" style="display:none">
                </div>

                <div class="app-actions-bar">
                    <button id="app-uninstall" class="btn btn-danger" disabled>Uninstall Selected</button>
                    <button id="app-disable" class="btn btn-warning" disabled>Disable Selected</button>
                    <button id="app-enable" class="btn btn-secondary" disabled>Enable Selected</button>
                    <button id="app-clear-data" class="btn btn-warning" disabled>Clear Data</button>
                    <button id="app-force-stop" class="btn btn-warning" disabled>Force Stop</button>
                </div>

                <div class="app-list-container">
                    <div class="app-list-header">
                        <div class="app-col-check">
                            <input type="checkbox" id="app-select-all">
                        </div>
                        <div class="app-col-name">Application</div>
                        <div class="app-col-package">Package Name</div>
                        <div class="app-col-version">Version</div>
                        <div class="app-col-size">Size</div>
                        <div class="app-col-status">Status</div>
                        <div class="app-col-actions">Actions</div>
                    </div>
                    <div class="app-list" id="app-list">
                        <div class="loading">Loading applications...</div>
                    </div>
                </div>

                <div class="app-status-bar">
                    <span id="app-selection-info">0 apps selected</span>
                    <span id="app-total-info"></span>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('app-filter')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterPackages();
        });

        document.getElementById('app-search')?.addEventListener('input', (e) => {
            this.searchPackages(e.target.value);
        });

        document.getElementById('app-refresh')?.addEventListener('click', () => this.loadPackages());

        document.getElementById('app-install')?.addEventListener('click', () => {
            document.getElementById('app-install-input')?.click();
        });

        document.getElementById('app-install-input')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.installAPK(e.target.files[0]);
            }
        });

        document.getElementById('app-select-all')?.addEventListener('change', (e) => {
            this.selectAllPackages(e.target.checked);
        });

        document.getElementById('app-uninstall')?.addEventListener('click', () => this.batchUninstall());
        document.getElementById('app-disable')?.addEventListener('click', () => this.batchDisable());
        document.getElementById('app-enable')?.addEventListener('click', () => this.batchEnable());
        document.getElementById('app-clear-data')?.addEventListener('click', () => this.batchClearData());
        document.getElementById('app-force-stop')?.addEventListener('click', () => this.batchForceStop());
    }

    // Load all packages from device
    async loadPackages() {
        const appList = document.getElementById('app-list');
        if (!appList) return;

        appList.innerHTML = '<div class="loading">Loading applications...</div>';

        try {
            this.log('Loading application list...', 'info');
            const packageNames = await this.adb.listPackages();

            this.packages = [];
            for (const packageName of packageNames) {
                try {
                    const info = await this.getPackageDetails(packageName);
                    this.packages.push(info);
                } catch (error) {
                    // Some packages may fail to get details
                    this.packages.push({
                        packageName,
                        label: packageName,
                        versionName: 'N/A',
                        versionCode: 'N/A',
                        isSystem: false,
                        isEnabled: true,
                        size: 0
                    });
                }
            }

            this.log(`Loaded ${this.packages.length} applications`, 'success');
            this.filterPackages();
        } catch (error) {
            appList.innerHTML = `<div class="error">Error loading applications: ${error.message}</div>`;
            this.log(`App list error: ${error.message}`, 'error');
        }
    }

    // Get package details
    async getPackageDetails(packageName) {
        const info = await this.adb.getPackageInfo(packageName);

        // Check if system app
        const pathInfo = await this.adb.shell(`pm path ${packageName}`);
        const isSystem = pathInfo.includes('/system/') || pathInfo.includes('/vendor/');

        // Check if enabled
        const enabledInfo = await this.adb.shell(`pm list packages -e ${packageName}`);
        const isEnabled = enabledInfo.includes(packageName);

        // Get app label (name)
        let label = packageName;
        try {
            const labelOutput = await this.adb.shell(`dumpsys package ${packageName} | grep -A1 "pkgFlags"`);
            // Simplified - would need better parsing
            label = packageName.split('.').pop();
        } catch (e) {
            // Use package name if label retrieval fails
        }

        return {
            packageName,
            label,
            versionName: info.versionName || 'N/A',
            versionCode: info.versionCode || 'N/A',
            isSystem,
            isEnabled,
            size: 0, // Would need to calculate from package paths
            firstInstallTime: info.firstInstallTime,
            lastUpdateTime: info.lastUpdateTime
        };
    }

    // Filter packages based on current filter
    filterPackages() {
        this.filteredPackages = this.packages.filter(pkg => {
            switch (this.currentFilter) {
                case 'user':
                    return !pkg.isSystem;
                case 'system':
                    return pkg.isSystem;
                case 'enabled':
                    return pkg.isEnabled;
                case 'disabled':
                    return !pkg.isEnabled;
                default:
                    return true;
            }
        });

        this.renderPackageList();
    }

    // Search packages
    searchPackages(query) {
        if (!query) {
            this.filterPackages();
            return;
        }

        const searchTerm = query.toLowerCase();
        this.filteredPackages = this.packages.filter(pkg => {
            return pkg.packageName.toLowerCase().includes(searchTerm) ||
                   pkg.label.toLowerCase().includes(searchTerm);
        });

        this.renderPackageList();
    }

    // Render package list
    renderPackageList() {
        const appList = document.getElementById('app-list');
        if (!appList) return;

        if (this.filteredPackages.length === 0) {
            appList.innerHTML = '<div class="empty">No applications found</div>';
            return;
        }

        // Sort by label
        this.filteredPackages.sort((a, b) => a.label.localeCompare(b.label));

        let html = '';
        for (const pkg of this.filteredPackages) {
            const selected = this.selectedPackages.has(pkg.packageName);
            const statusClass = pkg.isEnabled ? 'enabled' : 'disabled';
            const systemBadge = pkg.isSystem ? '<span class="badge badge-system">System</span>' : '<span class="badge badge-user">User</span>';

            html += `
                <div class="app-item ${statusClass}" data-package="${pkg.packageName}">
                    <div class="app-col-check">
                        <input type="checkbox" class="app-checkbox" ${selected ? 'checked' : ''}>
                    </div>
                    <div class="app-col-name">
                        <div class="app-label">${this.escapeHtml(pkg.label)}</div>
                    </div>
                    <div class="app-col-package">${this.escapeHtml(pkg.packageName)}</div>
                    <div class="app-col-version">${pkg.versionName}</div>
                    <div class="app-col-size">${this.formatSize(pkg.size)}</div>
                    <div class="app-col-status">
                        ${systemBadge}
                        <span class="badge badge-${pkg.isEnabled ? 'success' : 'danger'}">
                            ${pkg.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                    <div class="app-col-actions">
                        <button class="btn-icon" data-action="info" title="Info">ℹ</button>
                        <button class="btn-icon" data-action="launch" title="Launch">▶</button>
                        <button class="btn-icon" data-action="uninstall" title="Uninstall">🗑</button>
                    </div>
                </div>
            `;
        }

        appList.innerHTML = html;

        // Attach event listeners
        appList.querySelectorAll('.app-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const item = e.target.closest('.app-item');
                const packageName = item.dataset.package;

                if (e.target.checked) {
                    this.selectedPackages.add(packageName);
                } else {
                    this.selectedPackages.delete(packageName);
                }

                this.updateSelectionUI();
            });
        });

        appList.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.app-item');
                const packageName = item.dataset.package;
                const action = e.target.dataset.action;

                this.performAction(action, packageName);
            });
        });

        this.updateStatusBar();
    }

    // Perform action on package
    async performAction(action, packageName) {
        const pkg = this.packages.find(p => p.packageName === packageName);
        if (!pkg) return;

        switch (action) {
            case 'info':
                await this.showPackageInfo(pkg);
                break;
            case 'launch':
                await this.launchApp(packageName);
                break;
            case 'uninstall':
                await this.uninstallPackage(packageName);
                break;
        }
    }

    // Show package info
    async showPackageInfo(pkg) {
        const info = `
Package: ${pkg.packageName}
Label: ${pkg.label}
Version: ${pkg.versionName} (${pkg.versionCode})
Type: ${pkg.isSystem ? 'System' : 'User'}
Status: ${pkg.isEnabled ? 'Enabled' : 'Disabled'}
First Install: ${pkg.firstInstallTime}
Last Update: ${pkg.lastUpdateTime}
        `.trim();

        alert(info);
    }

    // Launch application
    async launchApp(packageName) {
        try {
            this.log(`Launching ${packageName}...`, 'info');
            await this.adb.shell(`monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`);
            this.log(`Launched ${packageName}`, 'success');
        } catch (error) {
            this.log(`Launch error: ${error.message}`, 'error');
        }
    }

    // Uninstall package
    async uninstallPackage(packageName) {
        if (!confirm(`Uninstall ${packageName}?`)) return;

        try {
            this.log(`Uninstalling ${packageName}...`, 'info');
            const result = await this.adb.uninstall(packageName);

            if (result) {
                this.log(`Uninstalled ${packageName}`, 'success');
                await this.loadPackages();
            } else {
                this.log(`Failed to uninstall ${packageName}`, 'error');
            }
        } catch (error) {
            this.log(`Uninstall error: ${error.message}`, 'error');
        }
    }

    // Install APK
    async installAPK(file) {
        try {
            this.log(`Installing ${file.name}...`, 'info');
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const apkData = new Uint8Array(e.target.result);
                    await this.adb.installAPK(apkData, (progress) => {
                        this.log(`Installing: ${Math.round(progress)}%`, 'info');
                    });

                    this.log(`Installed ${file.name}`, 'success');
                    await this.loadPackages();
                } catch (error) {
                    this.log(`Install error: ${error.message}`, 'error');
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            this.log(`Install error: ${error.message}`, 'error');
        }
    }

    // Batch operations
    async batchUninstall() {
        if (this.selectedPackages.size === 0) return;
        if (!confirm(`Uninstall ${this.selectedPackages.size} apps?`)) return;

        for (const packageName of this.selectedPackages) {
            try {
                await this.adb.uninstall(packageName);
                this.log(`Uninstalled ${packageName}`, 'success');
            } catch (error) {
                this.log(`Failed to uninstall ${packageName}: ${error.message}`, 'error');
            }
        }

        this.selectedPackages.clear();
        await this.loadPackages();
    }

    async batchDisable() {
        if (this.selectedPackages.size === 0) return;

        for (const packageName of this.selectedPackages) {
            try {
                await this.adb.shell(`pm disable-user ${packageName}`);
                this.log(`Disabled ${packageName}`, 'success');
            } catch (error) {
                this.log(`Failed to disable ${packageName}: ${error.message}`, 'error');
            }
        }

        await this.loadPackages();
    }

    async batchEnable() {
        if (this.selectedPackages.size === 0) return;

        for (const packageName of this.selectedPackages) {
            try {
                await this.adb.shell(`pm enable ${packageName}`);
                this.log(`Enabled ${packageName}`, 'success');
            } catch (error) {
                this.log(`Failed to enable ${packageName}: ${error.message}`, 'error');
            }
        }

        await this.loadPackages();
    }

    async batchClearData() {
        if (this.selectedPackages.size === 0) return;
        if (!confirm(`Clear data for ${this.selectedPackages.size} apps?`)) return;

        for (const packageName of this.selectedPackages) {
            try {
                await this.adb.shell(`pm clear ${packageName}`);
                this.log(`Cleared data for ${packageName}`, 'success');
            } catch (error) {
                this.log(`Failed to clear data for ${packageName}: ${error.message}`, 'error');
            }
        }
    }

    async batchForceStop() {
        if (this.selectedPackages.size === 0) return;

        for (const packageName of this.selectedPackages) {
            try {
                await this.adb.shell(`am force-stop ${packageName}`);
                this.log(`Force stopped ${packageName}`, 'success');
            } catch (error) {
                this.log(`Failed to force stop ${packageName}: ${error.message}`, 'error');
            }
        }
    }

    // Select all packages
    selectAllPackages(checked) {
        if (checked) {
            this.filteredPackages.forEach(pkg => this.selectedPackages.add(pkg.packageName));
        } else {
            this.selectedPackages.clear();
        }

        // Update checkboxes
        document.querySelectorAll('.app-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });

        this.updateSelectionUI();
    }

    // Update selection UI
    updateSelectionUI() {
        const selectionInfo = document.getElementById('app-selection-info');
        if (selectionInfo) {
            selectionInfo.textContent = `${this.selectedPackages.size} apps selected`;
        }

        // Enable/disable action buttons
        const hasSelection = this.selectedPackages.size > 0;
        document.getElementById('app-uninstall').disabled = !hasSelection;
        document.getElementById('app-disable').disabled = !hasSelection;
        document.getElementById('app-enable').disabled = !hasSelection;
        document.getElementById('app-clear-data').disabled = !hasSelection;
        document.getElementById('app-force-stop').disabled = !hasSelection;
    }

    // Update status bar
    updateStatusBar() {
        const totalInfo = document.getElementById('app-total-info');
        if (!totalInfo) return;

        const userApps = this.packages.filter(p => !p.isSystem).length;
        const systemApps = this.packages.filter(p => p.isSystem).length;

        totalInfo.textContent = `Total: ${this.packages.length} apps (${userApps} user, ${systemApps} system) | Showing: ${this.filteredPackages.length}`;
    }

    // Helper methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatSize(bytes) {
        if (bytes === 0) return 'N/A';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppManager;
}
