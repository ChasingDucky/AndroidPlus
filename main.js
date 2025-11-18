// AndroidPlus - Improved Main Application
// Enhanced with better protocol detection and error handling

class AndroidFlasher {
    constructor() {
        this.device = null;
        this.interfaceNumber = null;
        this.endpointIn = null;
        this.endpointOut = null;
        this.isConnected = false;
        this.deviceMode = null; // 'adb' or 'fastboot'
        this.logs = [];

        // ADB Protocol instance (if available)
        this.adbProtocol = null;
        this.fastbootProtocol = null;

        // WebADB Manager for full ADB support
        this.webADBManager = null;
        this.webADBAvailable = typeof WebADBManager !== 'undefined';

        this.initializeUI();
    }

    // Initialize UI event listeners
    initializeUI() {
        // Connection buttons
        document.getElementById('connect-btn')?.addEventListener('click', () => this.connectDevice());
        document.getElementById('disconnect-btn')?.addEventListener('click', () => this.disconnectDevice());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Fastboot operations
        document.getElementById('image-file')?.addEventListener('change', (e) => {
            const flashBtn = document.getElementById('flash-btn');
            if (flashBtn) flashBtn.disabled = !e.target.files.length;
        });

        document.getElementById('flash-btn')?.addEventListener('click', () => this.flashImage());
        document.getElementById('reboot-bootloader-btn')?.addEventListener('click', () => this.rebootToBootloader());
        document.getElementById('reboot-recovery-btn')?.addEventListener('click', () => this.rebootToRecovery());
        document.getElementById('reboot-btn')?.addEventListener('click', () => this.rebootSystem());
        document.getElementById('unlock-bootloader-btn')?.addEventListener('click', () => this.unlockBootloader());
        document.getElementById('lock-bootloader-btn')?.addEventListener('click', () => this.lockBootloader());
        document.getElementById('erase-partition-btn')?.addEventListener('click', () => this.erasePartition());

        // ADB operations
        document.getElementById('execute-adb-btn')?.addEventListener('click', () => this.executeADBCommand());
        document.getElementById('adb-command')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executeADBCommand();
        });
        document.querySelectorAll('.quick-cmd').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmdInput = document.getElementById('adb-command');
                if (cmdInput) {
                    cmdInput.value = e.target.dataset.cmd;
                    this.executeADBCommand();
                }
            });
        });

        // Tools operations
        document.getElementById('push-file-btn')?.addEventListener('click', () => this.pushFile());
        document.getElementById('screenshot-btn')?.addEventListener('click', () => this.takeScreenshot());
        document.getElementById('screenrecord-btn')?.addEventListener('click', () => this.startRecording());
        document.getElementById('stop-record-btn')?.addEventListener('click', () => this.stopRecording());

        // System info buttons
        document.getElementById('battery-info-btn')?.addEventListener('click', () => this.showBatteryInfo());
        document.getElementById('memory-info-btn')?.addEventListener('click', () => this.showMemoryInfo());
        document.getElementById('cpu-info-btn')?.addEventListener('click', () => this.showCPUInfo());

        // Console operations
        document.getElementById('clear-console-btn')?.addEventListener('click', () => this.clearConsole());
        document.getElementById('download-log-btn')?.addEventListener('click', () => this.downloadLog());

        // Language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect && window.i18n) {
            // Set current language in dropdown
            languageSelect.value = window.i18n.getLocale();

            // Listen for language changes
            languageSelect.addEventListener('change', async (e) => {
                await window.i18n.setLocale(e.target.value);
            });
        }

        // Listen for locale change events
        document.addEventListener('localeChanged', (e) => {
            this.log(`Language changed to: ${e.detail.locale}`, 'info');
        });
    }

    // Switch between operation tabs
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        event.target.classList.add('active');
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) tabContent.classList.add('active');
    }

    // Detect device mode (ADB or Fastboot)
    detectDeviceMode(interfaces) {
        for (const iface of interfaces) {
            const alternate = iface.alternates[0];
            if (alternate.interfaceClass === 0xFF && alternate.interfaceSubclass === 0x42) {
                if (alternate.interfaceProtocol === 0x01) {
                    return 'adb';
                } else if (alternate.interfaceProtocol === 0x03) {
                    return 'fastboot';
                }
            }
        }
        return null;
    }

    // Connect to Android device via WebUSB
    async connectDevice() {
        try {
            this.log('Requesting USB device...', 'info');

            // Request USB device with ADB/Fastboot filters
            this.device = await navigator.usb.requestDevice({
                filters: [
                    { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x01 }, // ADB
                    { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x03 }, // Fastboot
                ]
            });

            this.log(`Device selected: ${this.device.productName || 'Unknown Device'}`, 'success');

            // Open device
            await this.device.open();
            this.log('Device opened successfully', 'success');

            // Select configuration
            if (this.device.configuration === null) {
                await this.device.selectConfiguration(1);
            }

            // Find the correct interface
            const interfaces = this.device.configuration.interfaces;
            this.log(`Found ${interfaces.length} interface(s)`, 'info');

            // Detect device mode
            this.deviceMode = this.detectDeviceMode(interfaces);
            this.log(`Device mode detected: ${this.deviceMode || 'unknown'}`, 'info');

            for (const iface of interfaces) {
                const alternate = iface.alternates[0];
                // Look for ADB or Fastboot interface
                if (alternate.interfaceClass === 0xFF &&
                    alternate.interfaceSubclass === 0x42 &&
                    (alternate.interfaceProtocol === 0x01 || alternate.interfaceProtocol === 0x03)) {

                    this.interfaceNumber = iface.interfaceNumber;
                    await this.device.claimInterface(this.interfaceNumber);
                    this.log(`Claimed interface ${this.interfaceNumber}`, 'success');

                    // Find endpoints
                    for (const endpoint of alternate.endpoints) {
                        if (endpoint.direction === 'in') {
                            this.endpointIn = endpoint.endpointNumber;
                        } else if (endpoint.direction === 'out') {
                            this.endpointOut = endpoint.endpointNumber;
                        }
                    }
                    break;
                }
            }

            if (this.endpointIn === null || this.endpointOut === null) {
                throw new Error('Could not find ADB/Fastboot endpoints');
            }

            this.log(`Endpoints found - In: ${this.endpointIn}, Out: ${this.endpointOut}`, 'info');

            // Initialize protocol handlers if modules are loaded
            if (this.deviceMode === 'fastboot' && typeof FastbootProtocol !== 'undefined') {
                this.fastbootProtocol = new FastbootProtocol(this.device, this.endpointIn, this.endpointOut);
                this.log('Fastboot protocol initialized', 'success');
            } else if (this.deviceMode === 'adb') {
                // Try to use WebADB for full authentication support
                if (this.webADBAvailable) {
                    try {
                        this.log('Initializing WebADB with authentication...', 'info');
                        this.webADBManager = new WebADBManager((msg, type) => this.log(msg, type));
                        await this.webADBManager.initialize();

                        // Reconnect using WebADB
                        await this.device.close();
                        await this.webADBManager.connect();

                        this.log('✅ WebADB authenticated successfully!', 'success');
                        this.log('Full ADB features are now available', 'success');
                    } catch (webADBError) {
                        this.log(`WebADB initialization failed: ${webADBError.message}`, 'warning');
                        this.log('Falling back to basic ADB mode...', 'info');

                        // Reopen device for basic mode
                        await this.device.open();
                        if (this.device.configuration === null) {
                            await this.device.selectConfiguration(1);
                        }
                        await this.device.claimInterface(this.interfaceNumber);

                        if (typeof ADBProtocol !== 'undefined') {
                            this.adbProtocol = new ADBProtocol(this.device, this.endpointIn, this.endpointOut);
                            this.log('ADB protocol initialized (basic mode)', 'success');
                        }
                        this.webADBManager = null;
                    }
                } else {
                    // WebADB not available
                    this.log('⚠️ WebADB library not loaded', 'warning');
                    this.log('Run: npm install && npm run dev for full ADB support', 'info');

                    if (typeof ADBProtocol !== 'undefined') {
                        this.adbProtocol = new ADBProtocol(this.device, this.endpointIn, this.endpointOut);
                        this.log('ADB protocol initialized (basic mode)', 'success');
                    }
                }

                if (!this.webADBManager) {
                    this.log('⚠️ Note: Basic ADB mode has limited functionality', 'warning');
                    this.log('For file operations and shell commands, use full WebADB', 'info');
                }
            }

            this.isConnected = true;
            this.updateConnectionStatus(true);
            await this.getDeviceInfo();

        } catch (error) {
            this.log(`Connection error: ${error.message}`, 'error');
            this.updateConnectionStatus(false);
        }
    }

    // Disconnect from device
    async disconnectDevice() {
        try {
            // Disconnect WebADB if active
            if (this.webADBManager) {
                await this.webADBManager.disconnect();
                this.webADBManager = null;
            }

            if (this.device && this.interfaceNumber !== null) {
                await this.device.releaseInterface(this.interfaceNumber);
                await this.device.close();
            }

            this.device = null;
            this.interfaceNumber = null;
            this.endpointIn = null;
            this.endpointOut = null;
            this.isConnected = false;
            this.deviceMode = null;
            this.adbProtocol = null;
            this.fastbootProtocol = null;

            this.updateConnectionStatus(false);
            this.log('Disconnected from device', 'info');
        } catch (error) {
            this.log(`Disconnect error: ${error.message}`, 'error');
        }
    }

    // Update connection status UI
    updateConnectionStatus(connected) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('connection-status');
        const connectBtn = document.getElementById('connect-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const deviceInfo = document.getElementById('device-info');
        const operationsSection = document.getElementById('operations-section');

        if (connected) {
            if (statusIndicator) statusIndicator.classList.add('connected');
            if (statusText) {
                statusText.textContent = `Connected (${this.deviceMode || 'unknown'} mode)`;
            }
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (deviceInfo) deviceInfo.style.display = 'block';
            if (operationsSection) operationsSection.style.display = 'block';
        } else {
            if (statusIndicator) statusIndicator.classList.remove('connected');
            if (statusText) statusText.textContent = 'Not Connected';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (deviceInfo) deviceInfo.style.display = 'none';
            if (operationsSection) operationsSection.style.display = 'none';
        }
    }

    // Get device information
    async getDeviceInfo() {
        try {
            this.log('Retrieving device information...', 'info');

            const properties = {
                'device-model': this.device.productName || 'Unknown',
                'device-manufacturer': this.device.manufacturerName || 'Unknown',
                'device-serial': this.device.serialNumber || 'N/A',
            };

            // Try to get more info based on mode
            if (this.deviceMode === 'fastboot' && this.fastbootProtocol) {
                try {
                    const product = await this.fastbootProtocol.getvar('product');
                    const variant = await this.fastbootProtocol.getvar('variant');
                    const version = await this.fastbootProtocol.getvar('version-bootloader');

                    properties['device-model'] = product || properties['device-model'];
                    properties['device-android'] = 'Bootloader Mode';
                    properties['device-build'] = version || 'N/A';
                    properties['device-sdk'] = variant || 'N/A';
                } catch (e) {
                    this.log('Could not retrieve all fastboot variables', 'warning');
                }
            } else if (this.deviceMode === 'adb' && this.webADBManager) {
                // Use WebADB to get full device information
                try {
                    const deviceInfo = await this.webADBManager.getDeviceInfo();
                    properties['device-model'] = deviceInfo.model || properties['device-model'];
                    properties['device-manufacturer'] = deviceInfo.manufacturer || properties['device-manufacturer'];
                    properties['device-android'] = `Android ${deviceInfo.androidVersion}`;
                    properties['device-build'] = deviceInfo.buildId || 'N/A';
                    properties['device-sdk'] = `API ${deviceInfo.sdkVersion}`;
                    this.log('Full device information retrieved via WebADB', 'success');
                } catch (e) {
                    this.log('Could not retrieve device properties via WebADB', 'warning');
                    properties['device-android'] = 'ADB Mode (Authenticated)';
                    properties['device-build'] = 'N/A';
                    properties['device-sdk'] = 'N/A';
                }
            } else {
                // In ADB mode without WebADB, we can't get properties
                properties['device-android'] = 'ADB Mode (Auth Required)';
                properties['device-build'] = 'Run: npm install && npm run dev';
                properties['device-sdk'] = 'N/A';
            }

            // Update UI with device info
            for (const [id, value] of Object.entries(properties)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || 'Unknown';
                }
            }

            this.log('Device information retrieved successfully', 'success');
        } catch (error) {
            this.log(`Error getting device info: ${error.message}`, 'error');
        }
    }

    // Execute ADB command (requires authentication - not fully implemented)
    async executeADBCommand() {
        const cmdInput = document.getElementById('adb-command');
        if (!cmdInput) return;

        const command = cmdInput.value.trim();

        if (!command) {
            this.log('Please enter a command', 'error');
            return;
        }

        if (this.deviceMode !== 'adb') {
            this.log('Device must be in ADB mode for this operation', 'error');
            this.log('Current mode: ' + (this.deviceMode || 'unknown'), 'info');
            return;
        }

        this.log('⚠️ ADB command execution requires authentication', 'warning');
        this.log('Full ADB protocol support is in development', 'info');
        this.log('Please use adb command line tool for now, or reboot to fastboot mode', 'info');
    }

    // Fastboot: Flash image to partition
    async flashImage() {
        const partition = document.getElementById('partition-select')?.value;
        const fileInput = document.getElementById('image-file');
        const file = fileInput?.files[0];

        if (!file) {
            this.log('Please select an image file', 'error');
            return;
        }

        if (this.deviceMode !== 'fastboot') {
            this.log('Device must be in Fastboot mode for flashing', 'error');
            this.log('Please reboot to bootloader first', 'info');
            return;
        }

        if (!confirm(`Are you sure you want to flash ${file.name} to ${partition} partition? This may brick your device if done incorrectly.`)) {
            return;
        }

        try {
            this.log(`Starting to flash ${file.name} to ${partition}...`, 'info');
            this.showProgress(true);

            const reader = new FileReader();

            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 50; // First 50% is reading
                    this.updateProgress(progress, `Reading file: ${Math.round(progress)}%`);
                }
            };

            reader.onload = async (e) => {
                const imageData = new Uint8Array(e.target.result);
                this.log(`File loaded: ${imageData.length} bytes`, 'info');

                try {
                    if (this.fastbootProtocol) {
                        await this.fastbootProtocol.flash(partition, imageData, (progress) => {
                            this.updateProgress(50 + progress / 2, `Flashing ${partition}: ${Math.round(progress)}%`);
                        });
                    } else {
                        throw new Error('Fastboot protocol not initialized');
                    }

                    this.log(`Successfully flashed ${file.name} to ${partition}`, 'success');
                    this.updateProgress(100, 'Flash complete!');

                    setTimeout(() => this.showProgress(false), 2000);
                } catch (error) {
                    this.log(`Flash error: ${error.message}`, 'error');
                    this.showProgress(false);
                }
            };

            reader.onerror = (e) => {
                this.log('File read error', 'error');
                this.showProgress(false);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            this.log(`Flash error: ${error.message}`, 'error');
            this.showProgress(false);
        }
    }

    // Send Fastboot command
    async sendFastbootCommand(command, data = null) {
        if (this.deviceMode !== 'fastboot') {
            throw new Error('Device must be in Fastboot mode');
        }

        if (!this.fastbootProtocol) {
            throw new Error('Fastboot protocol not initialized');
        }

        return await this.fastbootProtocol.sendCommand(command);
    }

    // Reboot to bootloader
    async rebootToBootloader() {
        if (!confirm('Reboot device to bootloader mode?')) return;

        try {
            this.log('Rebooting to bootloader...', 'info');

            if (this.deviceMode === 'adb') {
                this.log('ADB reboot requires authentication - not yet supported', 'error');
                this.log('Please use: adb reboot bootloader', 'info');
                return;
            } else if (this.deviceMode === 'fastboot' && this.fastbootProtocol) {
                await this.fastbootProtocol.reboot('bootloader');
                this.log('Device is rebooting to bootloader', 'success');
            }

            setTimeout(() => this.disconnectDevice(), 1000);
        } catch (error) {
            this.log(`Reboot error: ${error.message}`, 'error');
        }
    }

    // Reboot to recovery
    async rebootToRecovery() {
        if (!confirm('Reboot device to recovery mode?')) return;

        try {
            this.log('Rebooting to recovery...', 'info');

            if (this.deviceMode === 'fastboot' && this.fastbootProtocol) {
                await this.fastbootProtocol.sendCommand('oem reboot-recovery');
                this.log('Device is rebooting to recovery', 'success');
            } else {
                this.log('Recovery reboot requires Fastboot mode or ADB with authentication', 'error');
            }

            setTimeout(() => this.disconnectDevice(), 1000);
        } catch (error) {
            this.log(`Reboot error: ${error.message}`, 'error');
        }
    }

    // Reboot system
    async rebootSystem() {
        if (!confirm('Reboot device?')) return;

        try {
            this.log('Rebooting device...', 'info');

            if (this.deviceMode === 'fastboot' && this.fastbootProtocol) {
                await this.fastbootProtocol.reboot();
                this.log('Device is rebooting', 'success');
            } else {
                this.log('Reboot requires Fastboot mode or ADB with authentication', 'error');
            }

            setTimeout(() => this.disconnectDevice(), 1000);
        } catch (error) {
            this.log(`Reboot error: ${error.message}`, 'error');
        }
    }

    // Unlock bootloader
    async unlockBootloader() {
        if (!confirm('WARNING: Unlocking bootloader will ERASE ALL DATA on your device! Continue?')) return;

        try {
            if (this.deviceMode !== 'fastboot') {
                this.log('Device must be in Fastboot mode to unlock bootloader', 'error');
                return;
            }

            this.log('Unlocking bootloader...', 'warning');

            if (this.fastbootProtocol) {
                await this.fastbootProtocol.unlock();
                this.log('Bootloader unlock command sent. Please confirm on device.', 'success');
            }
        } catch (error) {
            this.log(`Unlock error: ${error.message}`, 'error');
        }
    }

    // Lock bootloader
    async lockBootloader() {
        if (!confirm('Lock bootloader? This may brick your device if you have custom software installed.')) return;

        try {
            if (this.deviceMode !== 'fastboot') {
                this.log('Device must be in Fastboot mode to lock bootloader', 'error');
                return;
            }

            this.log('Locking bootloader...', 'warning');

            if (this.fastbootProtocol) {
                await this.fastbootProtocol.lock();
                this.log('Bootloader lock command sent. Please confirm on device.', 'success');
            }
        } catch (error) {
            this.log(`Lock error: ${error.message}`, 'error');
        }
    }

    // Erase partition
    async erasePartition() {
        const partition = document.getElementById('partition-select')?.value;

        if (!confirm(`DANGER: Erase ${partition} partition? This cannot be undone!`)) return;

        try {
            if (this.deviceMode !== 'fastboot') {
                this.log('Device must be in Fastboot mode to erase partitions', 'error');
                return;
            }

            this.log(`Erasing ${partition} partition...`, 'warning');

            if (this.fastbootProtocol) {
                await this.fastbootProtocol.erase(partition);
                this.log(`${partition} partition erased successfully`, 'success');
            }
        } catch (error) {
            this.log(`Erase error: ${error.message}`, 'error');
        }
    }

    // Execute raw ADB shell command
    async executeRawShellCommand(command) {
        if (this.deviceMode !== 'adb') {
            throw new Error('Device must be in ADB mode');
        }

        // Use WebADB if available (authenticated connection)
        if (this.webADBManager) {
            try {
                this.log(`Executing shell: ${command}`, 'info');
                const result = await this.webADBManager.shell(command);
                if (result) {
                    this.log('✅ Command executed successfully', 'success');
                    return result;
                }
                return '';
            } catch (error) {
                throw new Error(`WebADB shell error: ${error.message}`);
            }
        }

        // Fallback to basic mode (usually fails due to authentication)
        try {
            this.log(`Executing shell: ${command}`, 'info');
            this.log('⚠️ Warning: Using unauthenticated connection', 'warning');
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const shellCmd = `shell:${command}\0`;
            const cmdBytes = encoder.encode(shellCmd);
            await this.device.transferOut(this.endpointOut, cmdBytes);
            this.log('Command sent...', 'info');
            try {
                const result = await this.device.transferIn(this.endpointIn, 65536);
                if (result.data && result.data.byteLength > 0) {
                    return decoder.decode(result.data);
                }
            } catch (e) {
                this.log(`Response: ${e.message}`, 'warning');
                throw new Error('Authentication required. Run: npm install && npm run dev');
            }
            return '';
        } catch (error) {
            throw error;
        }
    }

    // Execute ADB command
    async executeADBCommand() {
        const cmdInput = document.getElementById('adb-command');
        if (!cmdInput) return;
        const command = cmdInput.value.trim();
        if (!command) {
            this.log('Please enter a command', 'error');
            return;
        }
        if (this.deviceMode !== 'adb') {
            this.log('Device must be in ADB mode', 'error');
            return;
        }
        try {
            this.log(`Executing: ${command}`, 'info');
            const result = await this.executeRawShellCommand(command);
            if (result && result.length > 0) {
                this.log('Output:', 'success');
                result.split('\n').forEach(line => {
                    if (line.trim()) this.log(`  ${line}`, 'info');
                });
            } else {
                this.log('Command sent (no output)', 'info');
            }
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
        }
    }

    // Push file
    async pushFile() {
        if (this.deviceMode !== 'adb') {
            this.log('File push requires ADB mode', 'error');
            return;
        }

        if (!this.webADBManager) {
            this.log('File push requires WebADB library', 'warning');
            this.log('Run: npm install && npm run dev', 'info');
            return;
        }

        try {
            // Create file input
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const remotePath = prompt(`Enter remote path for ${file.name}:`, `/sdcard/${file.name}`);
                if (!remotePath) return;

                this.log(`Pushing file: ${file.name} (${file.size} bytes)`, 'info');

                try {
                    await this.webADBManager.pushFile(file, remotePath, (progress) => {
                        if (progress && progress.percentage) {
                            this.log(`Upload progress: ${Math.round(progress.percentage)}%`, 'info');
                        }
                    });
                    this.log(`✅ File pushed successfully to ${remotePath}`, 'success');
                } catch (error) {
                    this.log(`File push failed: ${error.message}`, 'error');
                }
            };
            input.click();
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
        }
    }

    // Take screenshot
    async takeScreenshot() {
        if (this.deviceMode !== 'adb') {
            this.log('Screenshot requires ADB mode', 'error');
            return;
        }
        try {
            this.log('Taking screenshot...', 'info');
            await this.executeRawShellCommand('screencap -p /sdcard/AndroidPlus_screenshot.png');
            this.log('Screenshot saved: /sdcard/AndroidPlus_screenshot.png', 'success');
        } catch (error) {
            this.log(`Screenshot error: ${error.message}`, 'error');
        }
    }

    // Start recording
    async startRecording() {
        if (this.deviceMode !== 'adb') {
            this.log('Recording requires ADB mode', 'error');
            return;
        }
        try {
            this.log('Starting recording...', 'info');
            await this.executeRawShellCommand('screenrecord /sdcard/AndroidPlus_recording.mp4 &');
            this.log('Recording started', 'success');
            document.getElementById('screenrecord-btn').disabled = true;
            document.getElementById('stop-record-btn').disabled = false;
        } catch (error) {
            this.log(`Recording error: ${error.message}`, 'error');
        }
    }

    // Stop recording
    async stopRecording() {
        try {
            await this.executeRawShellCommand('pkill -SIGINT screenrecord');
            this.log('Recording stopped: /sdcard/AndroidPlus_recording.mp4', 'success');
            document.getElementById('screenrecord-btn').disabled = false;
            document.getElementById('stop-record-btn').disabled = true;
        } catch (error) {
            this.log(`Stop error: ${error.message}`, 'error');
        }
    }

    // Battery info
    async showBatteryInfo() {
        if (this.deviceMode !== 'adb') {
            this.log('Battery info requires ADB mode', 'error');
            return;
        }
        try {
            this.log('Getting battery info...', 'info');
            const result = await this.executeRawShellCommand('dumpsys battery');
            if (result && result.length > 0) {
                this.log('Battery Information:', 'success');
                result.split('\n').forEach(line => {
                    if (line.includes('level') || line.includes('temperature') ||
                        line.includes('voltage') || line.includes('status')) {
                        this.log(`  ${line.trim()}`, 'info');
                    }
                });
            }
        } catch (error) {
            this.log(`Battery error: ${error.message}`, 'error');
        }
    }

    // Memory info
    async showMemoryInfo() {
        if (this.deviceMode !== 'adb') {
            this.log('Memory info requires ADB mode', 'error');
            return;
        }
        try {
            this.log('Getting memory info...', 'info');
            const result = await this.executeRawShellCommand('cat /proc/meminfo | head -20');
            if (result && result.length > 0) {
                this.log('Memory Information:', 'success');
                result.split('\n').slice(0, 10).forEach(line => {
                    if (line.trim()) this.log(`  ${line.trim()}`, 'info');
                });
            }
        } catch (error) {
            this.log(`Memory error: ${error.message}`, 'error');
        }
    }

    // CPU info
    async showCPUInfo() {
        if (this.deviceMode !== 'adb') {
            this.log('CPU info requires ADB mode', 'error');
            return;
        }
        try {
            this.log('Getting CPU info...', 'info');
            const result = await this.executeRawShellCommand('cat /proc/cpuinfo | head -30');
            if (result && result.length > 0) {
                this.log('CPU Information:', 'success');
                result.split('\n').slice(0, 15).forEach(line => {
                    if (line.trim()) this.log(`  ${line.trim()}`, 'info');
                });
            }
        } catch (error) {
            this.log(`CPU error: ${error.message}`, 'error');
        }
    }

    // Show/hide progress bar
    showProgress(show) {
        const progressSection = document.getElementById('progress-section');
        if (progressSection) {
            progressSection.style.display = show ? 'block' : 'none';
        }
        if (!show) {
            this.updateProgress(0, '');
        }
    }

    // Update progress bar
    updateProgress(percent, message) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const operationStatus = document.getElementById('operation-status');

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
        if (operationStatus) operationStatus.textContent = message;
    }

    // Log message to console
    log(message, type = 'info') {
        const consoleEl = document.getElementById('console');
        if (!consoleEl) return;

        const timestamp = new Date().toLocaleTimeString();

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        entry.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> ${message}`;

        consoleEl.appendChild(entry);
        consoleEl.scrollTop = consoleEl.scrollHeight;

        // Store in logs array
        this.logs.push({ timestamp, message, type });
    }

    // Clear console
    clearConsole() {
        const consoleEl = document.getElementById('console');
        if (consoleEl) consoleEl.innerHTML = '';
        this.logs = [];
        this.log('Console cleared', 'info');
    }

    // Download log file
    downloadLog() {
        const logText = this.logs.map(log =>
            `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `androidplus-log-${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('Log file downloaded', 'success');
    }
}

// Initialize the application
const app = new AndroidFlasher();

// Log initialization
app.log('AndroidPlus initialized', 'success');
app.log('Click "Connect Device" to begin', 'info');

// Check WebUSB support
if (!navigator.usb) {
    app.log('ERROR: WebUSB is not supported in this browser. Please use Chrome, Edge, or Opera.', 'error');
} else {
    app.log('💡 Tip: For best results, connect your device in Fastboot mode', 'info');
    app.log('To enter Fastboot: Power off device, then hold Power + Volume Down', 'info');
}
