// Batch Operations and Script Support
// Execute scripted batch operations on devices

class BatchOperations {
    constructor(adbProtocol, fastbootProtocol, logCallback) {
        this.adb = adbProtocol;
        this.fastboot = fastbootProtocol;
        this.log = logCallback;
        this.isRunning = false;
        this.currentScript = null;
        this.scriptQueue = [];
    }

    // Initialize batch operations UI
    initializeUI() {
        this.createBatchOpsHTML();
        this.attachEventListeners();
    }

    // Create batch operations HTML
    createBatchOpsHTML() {
        const container = document.getElementById('batch-ops-content');
        if (!container) return;

        container.innerHTML = `
            <div class="batch-operations">
                <div class="batch-toolbar">
                    <button id="batch-load-script" class="btn btn-secondary">Load Script</button>
                    <button id="batch-save-script" class="btn btn-secondary">Save Script</button>
                    <button id="batch-run" class="btn btn-primary">Run Script</button>
                    <button id="batch-stop" class="btn btn-danger" disabled>Stop</button>
                    <input type="file" id="batch-script-input" accept=".json,.txt" style="display:none">
                </div>

                <div class="batch-templates">
                    <h3>Quick Templates:</h3>
                    <div class="template-grid">
                        <button class="template-btn" data-template="flash-full-rom">Flash Full ROM</button>
                        <button class="template-btn" data-template="debloat">Debloat Device</button>
                        <button class="template-btn" data-template="backup">Backup Apps</button>
                        <button class="template-btn" data-template="optimize">Optimize Performance</button>
                    </div>
                </div>

                <div class="script-editor">
                    <h3>Script Editor</h3>
                    <div class="editor-toolbar">
                        <button id="script-add-flash" class="btn btn-small">Add Flash Step</button>
                        <button id="script-add-command" class="btn btn-small">Add Command</button>
                        <button id="script-add-reboot" class="btn btn-small">Add Reboot</button>
                        <button id="script-add-wait" class="btn btn-small">Add Wait</button>
                        <button id="script-clear" class="btn btn-small btn-danger">Clear All</button>
                    </div>
                    <div class="script-steps" id="script-steps">
                        <div class="empty">No steps added. Use buttons above to add operations.</div>
                    </div>
                </div>

                <div class="script-preview">
                    <h3>Script Preview (JSON)</h3>
                    <textarea id="script-json" class="script-textarea" rows="15"></textarea>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('batch-load-script')?.addEventListener('click', () => {
            document.getElementById('batch-script-input')?.click();
        });

        document.getElementById('batch-script-input')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadScript(e.target.files[0]);
            }
        });

        document.getElementById('batch-save-script')?.addEventListener('click', () => this.saveScript());
        document.getElementById('batch-run')?.addEventListener('click', () => this.runScript());
        document.getElementById('batch-stop')?.addEventListener('click', () => this.stopScript());

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadTemplate(btn.dataset.template);
            });
        });

        // Editor toolbar buttons
        document.getElementById('script-add-flash')?.addEventListener('click', () => this.addFlashStep());
        document.getElementById('script-add-command')?.addEventListener('click', () => this.addCommandStep());
        document.getElementById('script-add-reboot')?.addEventListener('click', () => this.addRebootStep());
        document.getElementById('script-add-wait')?.addEventListener('click', () => this.addWaitStep());
        document.getElementById('script-clear')?.addEventListener('click', () => this.clearScript());

        // Script JSON editing
        document.getElementById('script-json')?.addEventListener('change', (e) => {
            try {
                this.currentScript = JSON.parse(e.target.value);
                this.renderScriptSteps();
            } catch (error) {
                this.log(`Invalid JSON: ${error.message}`, 'error');
            }
        });
    }

    // Load script from file
    async loadScript(file) {
        try {
            const text = await file.text();
            this.currentScript = JSON.parse(text);
            this.renderScriptSteps();
            this.updateScriptPreview();
            this.log(`Loaded script: ${file.name}`, 'success');
        } catch (error) {
            this.log(`Failed to load script: ${error.message}`, 'error');
        }
    }

    // Save script to file
    saveScript() {
        if (!this.currentScript || this.currentScript.steps.length === 0) {
            this.log('No script to save', 'error');
            return;
        }

        const json = JSON.stringify(this.currentScript, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flash-script-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('Script saved', 'success');
    }

    // Run the script
    async runScript() {
        if (!this.currentScript || this.currentScript.steps.length === 0) {
            this.log('No script to run', 'error');
            return;
        }

        if (!confirm('Run this script? Make sure you understand what it does.')) {
            return;
        }

        this.isRunning = true;
        document.getElementById('batch-run').disabled = true;
        document.getElementById('batch-stop').disabled = false;

        this.log('Starting script execution...', 'info');

        try {
            for (let i = 0; i < this.currentScript.steps.length; i++) {
                if (!this.isRunning) {
                    this.log('Script execution stopped by user', 'warning');
                    break;
                }

                const step = this.currentScript.steps[i];
                this.log(`Step ${i + 1}/${this.currentScript.steps.length}: ${step.type}`, 'info');

                await this.executeStep(step);
            }

            this.log('Script execution completed!', 'success');
        } catch (error) {
            this.log(`Script execution failed: ${error.message}`, 'error');
        } finally {
            this.isRunning = false;
            document.getElementById('batch-run').disabled = false;
            document.getElementById('batch-stop').disabled = true;
        }
    }

    // Stop script execution
    stopScript() {
        this.isRunning = false;
        this.log('Stopping script execution...', 'warning');
    }

    // Execute a single step
    async executeStep(step) {
        switch (step.type) {
            case 'flash':
                await this.executeFlash(step);
                break;
            case 'command':
                await this.executeCommand(step);
                break;
            case 'reboot':
                await this.executeReboot(step);
                break;
            case 'wait':
                await this.executeWait(step);
                break;
            case 'fastboot':
                await this.executeFastboot(step);
                break;
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    // Execute flash step
    async executeFlash(step) {
        this.log(`Flashing ${step.partition} with ${step.file}...`, 'info');
        // In real implementation, would need to handle file selection
        throw new Error('Flash step requires file implementation');
    }

    // Execute ADB command
    async executeCommand(step) {
        this.log(`Executing: ${step.command}`, 'info');
        const result = await this.adb.shell(step.command);
        this.log(`Result: ${result}`, 'info');
    }

    // Execute reboot
    async executeReboot(step) {
        this.log(`Rebooting to ${step.target || 'system'}...`, 'info');
        await this.adb.reboot(step.target || '');
    }

    // Execute wait
    async executeWait(step) {
        const seconds = step.duration || 5;
        this.log(`Waiting ${seconds} seconds...`, 'info');
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // Execute fastboot command
    async executeFastboot(step) {
        this.log(`Fastboot: ${step.command}`, 'info');
        await this.fastboot.sendCommand(step.command);
    }

    // Load template
    loadTemplate(templateName) {
        const templates = {
            'flash-full-rom': {
                name: 'Flash Full ROM',
                description: 'Flash all partitions of a ROM',
                steps: [
                    { type: 'reboot', target: 'bootloader' },
                    { type: 'wait', duration: 5 },
                    { type: 'flash', partition: 'boot', file: 'boot.img' },
                    { type: 'flash', partition: 'system', file: 'system.img' },
                    { type: 'flash', partition: 'vendor', file: 'vendor.img' },
                    { type: 'flash', partition: 'vbmeta', file: 'vbmeta.img' },
                    { type: 'fastboot', command: 'erase:userdata' },
                    { type: 'fastboot', command: 'erase:cache' },
                    { type: 'reboot', target: '' }
                ]
            },
            'debloat': {
                name: 'Debloat Device',
                description: 'Remove common bloatware apps',
                steps: [
                    { type: 'command', command: 'pm uninstall --user 0 com.facebook.katana' },
                    { type: 'command', command: 'pm uninstall --user 0 com.facebook.services' },
                    { type: 'command', command: 'pm uninstall --user 0 com.facebook.appmanager' },
                    { type: 'command', command: 'pm uninstall --user 0 com.facebook.system' },
                    { type: 'command', command: 'pm disable-user com.google.android.apps.tachyon' },
                    { type: 'command', command: 'pm disable-user com.android.chrome' }
                ]
            },
            'backup': {
                name: 'Backup Apps',
                description: 'Backup user apps and data',
                steps: [
                    { type: 'command', command: 'pm list packages -3' },
                    { type: 'wait', duration: 2 }
                ]
            },
            'optimize': {
                name: 'Optimize Performance',
                description: 'Apply performance tweaks',
                steps: [
                    { type: 'command', command: 'settings put global window_animation_scale 0.5' },
                    { type: 'command', command: 'settings put global transition_animation_scale 0.5' },
                    { type: 'command', command: 'settings put global animator_duration_scale 0.5' },
                    { type: 'command', command: 'pm trim-caches 1000000000' }
                ]
            }
        };

        if (templates[templateName]) {
            this.currentScript = templates[templateName];
            this.renderScriptSteps();
            this.updateScriptPreview();
            this.log(`Loaded template: ${templates[templateName].name}`, 'success');
        }
    }

    // Add script steps
    addFlashStep() {
        const partition = prompt('Partition name:', 'boot');
        const file = prompt('Image file name:', 'boot.img');

        if (partition && file) {
            this.addStep({ type: 'flash', partition, file });
        }
    }

    addCommandStep() {
        const command = prompt('ADB shell command:');
        if (command) {
            this.addStep({ type: 'command', command });
        }
    }

    addRebootStep() {
        const target = prompt('Reboot target (leave empty for normal reboot):', '');
        this.addStep({ type: 'reboot', target });
    }

    addWaitStep() {
        const duration = prompt('Wait duration (seconds):', '5');
        if (duration) {
            this.addStep({ type: 'wait', duration: parseInt(duration) });
        }
    }

    // Add step to script
    addStep(step) {
        if (!this.currentScript) {
            this.currentScript = {
                name: 'New Script',
                description: '',
                steps: []
            };
        }

        this.currentScript.steps.push(step);
        this.renderScriptSteps();
        this.updateScriptPreview();
    }

    // Clear all steps
    clearScript() {
        if (confirm('Clear all steps?')) {
            this.currentScript = {
                name: 'New Script',
                description: '',
                steps: []
            };
            this.renderScriptSteps();
            this.updateScriptPreview();
        }
    }

    // Render script steps
    renderScriptSteps() {
        const container = document.getElementById('script-steps');
        if (!container) return;

        if (!this.currentScript || this.currentScript.steps.length === 0) {
            container.innerHTML = '<div class="empty">No steps added. Use buttons above to add operations.</div>';
            return;
        }

        let html = '';
        this.currentScript.steps.forEach((step, index) => {
            const stepDesc = this.getStepDescription(step);
            html += `
                <div class="script-step" data-index="${index}">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-type">${step.type}</span>
                    <span class="step-desc">${stepDesc}</span>
                    <button class="btn-icon btn-remove" data-index="${index}">×</button>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add remove handlers
        container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.removeStep(index);
            });
        });
    }

    // Get step description
    getStepDescription(step) {
        switch (step.type) {
            case 'flash':
                return `Flash ${step.file} to ${step.partition}`;
            case 'command':
                return step.command;
            case 'reboot':
                return `Reboot to ${step.target || 'system'}`;
            case 'wait':
                return `Wait ${step.duration} seconds`;
            case 'fastboot':
                return `Fastboot: ${step.command}`;
            default:
                return 'Unknown step';
        }
    }

    // Remove step
    removeStep(index) {
        this.currentScript.steps.splice(index, 1);
        this.renderScriptSteps();
        this.updateScriptPreview();
    }

    // Update script preview
    updateScriptPreview() {
        const textarea = document.getElementById('script-json');
        if (textarea && this.currentScript) {
            textarea.value = JSON.stringify(this.currentScript, null, 2);
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchOperations;
}
