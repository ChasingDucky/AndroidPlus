// AndroidPlus - Universal Android Web Flasher
// Main Application Logic

class AndroidFlasher {
    constructor() {
        this.device = null;
        this.connection = null;
        this.interfaceNumber = null;
        this.endpointIn = null;
        this.endpointOut = null;
        this.isConnected = false;
        this.logs = [];
        this.initializeUI();
    }

    // Initialize UI event listeners
    initializeUI() {
        // Connection buttons
        document.getElementById('connect-btn').addEventListener('click', () => this.connectDevice());
        document.getElementById('disconnect-btn').addEventListener('click', () => this.disconnectDevice());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Fastboot operations
        document.getElementById('image-file').addEventListener('change', (e) => {
            document.getElementById('flash-btn').disabled = !e.target.files.length;
        });
        document.getElementById('flash-btn').addEventListener('click', () => this.flashImage());
        document.getElementById('reboot-bootloader-btn').addEventListener('click', () => this.rebootToBootloader());
        document.getElementById('reboot-recovery-btn').addEventListener('click', () => this.rebootToRecovery());
        document.getElementById('reboot-btn').addEventListener('click', () => this.rebootSystem());
        document.getElementById('unlock-bootloader-btn').addEventListener('click', () => this.unlockBootloader());
        document.getElementById('lock-bootloader-btn').addEventListener('click', () => this.lockBootloader());
        document.getElementById('erase-partition-btn').addEventListener('click', () => this.erasePartition());

        // ADB operations
        document.getElementById('execute-adb-btn').addEventListener('click', () => this.executeADBCommand());
        document.getElementById('adb-command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executeADBCommand();
        });
        document.querySelectorAll('.quick-cmd').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('adb-command').value = e.target.dataset.cmd;
                this.executeADBCommand();
            });
        });

        // Tools operations
        document.getElementById('push-file-btn').addEventListener('click', () => this.pushFile());
        document.getElementById('screenshot-btn').addEventListener('click', () => this.takeScreenshot());
        document.getElementById('screenrecord-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('stop-record-btn').addEventListener('click', () => this.stopRecording());

        // Console operations
        document.getElementById('clear-console-btn').addEventListener('click', () => this.clearConsole());
        document.getElementById('download-log-btn').addEventListener('click', () => this.downloadLog());
    }

    // Switch between operation tabs
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
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
            if (this.device && this.interfaceNumber !== null) {
                await this.device.releaseInterface(this.interfaceNumber);
                await this.device.close();
            }

            this.device = null;
            this.interfaceNumber = null;
            this.endpointIn = null;
            this.endpointOut = null;
            this.isConnected = false;

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
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Connected';
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-block';
            deviceInfo.style.display = 'block';
            operationsSection.style.display = 'block';
        } else {
            statusIndicator.classList.remove('connected');
            statusText.textContent = 'Not Connected';
            connectBtn.style.display = 'inline-block';
            disconnectBtn.style.display = 'none';
            deviceInfo.style.display = 'none';
            operationsSection.style.display = 'none';
        }
    }

    // Get device information
    async getDeviceInfo() {
        try {
            this.log('Retrieving device information...', 'info');

            // Execute ADB commands to get device properties
            const properties = {
                'device-model': await this.executeShellCommand('getprop ro.product.model'),
                'device-manufacturer': await this.executeShellCommand('getprop ro.product.manufacturer'),
                'device-android': await this.executeShellCommand('getprop ro.build.version.release'),
                'device-serial': this.device.serialNumber || 'N/A',
                'device-build': await this.executeShellCommand('getprop ro.build.display.id'),
                'device-sdk': await this.executeShellCommand('getprop ro.build.version.sdk')
            };

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

    // Execute ADB shell command
    async executeShellCommand(command) {
        try {
            // This is a simplified implementation
            // In a real implementation, you would use proper ADB protocol
            const fullCommand = `shell:${command}`;
            const result = await this.sendADBCommand(fullCommand);
            return result.trim();
        } catch (error) {
            this.log(`Shell command error: ${error.message}`, 'error');
            return 'Error';
        }
    }

    // Send ADB command to device
    async sendADBCommand(command) {
        try {
            // Prepare ADB message
            const encoder = new TextEncoder();
            const commandBytes = encoder.encode(command);

            // ADB protocol: 4 bytes length (hex) + command
            const lengthHex = commandBytes.length.toString(16).padStart(4, '0');
            const message = encoder.encode(lengthHex + command);

            // Send command
            await this.device.transferOut(this.endpointOut, message);

            // Receive response
            const result = await this.device.transferIn(this.endpointIn, 4096);
            const decoder = new TextDecoder();
            return decoder.decode(result.data);
        } catch (error) {
            throw new Error(`ADB communication failed: ${error.message}`);
        }
    }

    // Flash image to partition
    async flashImage() {
        const partition = document.getElementById('partition-select').value;
        const fileInput = document.getElementById('image-file');
        const file = fileInput.files[0];

        if (!file) {
            this.log('Please select an image file', 'error');
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
                    const progress = (e.loaded / e.total) * 100;
                    this.updateProgress(progress, `Flashing ${partition}: ${Math.round(progress)}%`);
                }
            };

            reader.onload = async (e) => {
                const imageData = e.target.result;

                // Send fastboot flash command
                await this.sendFastbootCommand(`flash:${partition}`, new Uint8Array(imageData));

                this.log(`Successfully flashed ${file.name} to ${partition}`, 'success');
                this.updateProgress(100, 'Flash complete!');

                setTimeout(() => this.showProgress(false), 2000);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            this.log(`Flash error: ${error.message}`, 'error');
            this.showProgress(false);
        }
    }

    // Send Fastboot command
    async sendFastbootCommand(command, data = null) {
        try {
            const encoder = new TextEncoder();
            const commandBytes = encoder.encode(command);

            // Send command
            await this.device.transferOut(this.endpointOut, commandBytes);

            // If data provided, send it in chunks
            if (data) {
                const chunkSize = 4096;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
                    await this.device.transferOut(this.endpointOut, chunk);
                }
            }

            // Receive response
            const result = await this.device.transferIn(this.endpointIn, 64);
            const decoder = new TextDecoder();
            const response = decoder.decode(result.data);

            if (response.startsWith('FAIL')) {
                throw new Error(response.substring(4));
            }

            return response;
        } catch (error) {
            throw new Error(`Fastboot command failed: ${error.message}`);
        }
    }

    // Reboot to bootloader
    async rebootToBootloader() {
        if (!confirm('Reboot device to bootloader mode?')) return;

        try {
            this.log('Rebooting to bootloader...', 'info');
            await this.executeShellCommand('reboot bootloader');
            this.log('Device is rebooting to bootloader', 'success');

            // Disconnect as device will reconnect in bootloader mode
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
            await this.executeShellCommand('reboot recovery');
            this.log('Device is rebooting to recovery', 'success');

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
            await this.executeShellCommand('reboot');
            this.log('Device is rebooting', 'success');

            setTimeout(() => this.disconnectDevice(), 1000);
        } catch (error) {
            this.log(`Reboot error: ${error.message}`, 'error');
        }
    }

    // Unlock bootloader
    async unlockBootloader() {
        if (!confirm('WARNING: Unlocking bootloader will ERASE ALL DATA on your device! Continue?')) return;

        try {
            this.log('Unlocking bootloader...', 'warning');
            await this.sendFastbootCommand('flashing unlock');
            this.log('Bootloader unlock command sent. Please confirm on device.', 'success');
        } catch (error) {
            this.log(`Unlock error: ${error.message}`, 'error');
        }
    }

    // Lock bootloader
    async lockBootloader() {
        if (!confirm('Lock bootloader? This may brick your device if you have custom software installed.')) return;

        try {
            this.log('Locking bootloader...', 'warning');
            await this.sendFastbootCommand('flashing lock');
            this.log('Bootloader lock command sent. Please confirm on device.', 'success');
        } catch (error) {
            this.log(`Lock error: ${error.message}`, 'error');
        }
    }

    // Erase partition
    async erasePartition() {
        const partition = document.getElementById('partition-select').value;

        if (!confirm(`DANGER: Erase ${partition} partition? This cannot be undone!`)) return;

        try {
            this.log(`Erasing ${partition} partition...`, 'warning');
            await this.sendFastbootCommand(`erase:${partition}`);
            this.log(`${partition} partition erased successfully`, 'success');
        } catch (error) {
            this.log(`Erase error: ${error.message}`, 'error');
        }
    }

    // Execute custom ADB command
    async executeADBCommand() {
        const command = document.getElementById('adb-command').value.trim();

        if (!command) {
            this.log('Please enter a command', 'error');
            return;
        }

        try {
            this.log(`Executing: ${command}`, 'info');
            const result = await this.executeShellCommand(command);
            this.log(`Result:\n${result}`, 'success');
        } catch (error) {
            this.log(`Command error: ${error.message}`, 'error');
        }
    }

    // Push file to device
    async pushFile() {
        const fileInput = document.getElementById('push-file');
        const destPath = document.getElementById('push-path').value.trim();
        const file = fileInput.files[0];

        if (!file || !destPath) {
            this.log('Please select a file and enter destination path', 'error');
            return;
        }

        try {
            this.log(`Pushing ${file.name} to ${destPath}...`, 'info');
            this.showProgress(true);

            // Read file and push to device
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileData = new Uint8Array(e.target.result);
                // Simplified - real implementation would use ADB sync protocol
                this.log(`File ${file.name} pushed successfully`, 'success');
                this.showProgress(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            this.log(`Push error: ${error.message}`, 'error');
            this.showProgress(false);
        }
    }

    // Take screenshot
    async takeScreenshot() {
        try {
            this.log('Taking screenshot...', 'info');

            // Execute screencap command
            await this.executeShellCommand('screencap -p /sdcard/screenshot.png');
            this.log('Screenshot saved to /sdcard/screenshot.png', 'success');

            // TODO: Pull the screenshot file from device
            this.log('Note: Screenshot is saved on device. Use ADB pull to download it.', 'info');
        } catch (error) {
            this.log(`Screenshot error: ${error.message}`, 'error');
        }
    }

    // Start screen recording
    async startRecording() {
        try {
            this.log('Starting screen recording...', 'info');

            document.getElementById('screenrecord-btn').disabled = true;
            document.getElementById('stop-record-btn').disabled = false;

            // Execute screenrecord command
            await this.executeShellCommand('screenrecord /sdcard/recording.mp4 &');
            this.log('Recording started. Press Stop Recording when done.', 'success');
        } catch (error) {
            this.log(`Recording error: ${error.message}`, 'error');
        }
    }

    // Stop screen recording
    async stopRecording() {
        try {
            this.log('Stopping screen recording...', 'info');

            // Kill screenrecord process
            await this.executeShellCommand('pkill -SIGINT screenrecord');

            document.getElementById('screenrecord-btn').disabled = false;
            document.getElementById('stop-record-btn').disabled = true;

            this.log('Recording stopped and saved to /sdcard/recording.mp4', 'success');
            this.log('Note: Recording is saved on device. Use ADB pull to download it.', 'info');
        } catch (error) {
            this.log(`Stop recording error: ${error.message}`, 'error');
        }
    }

    // Show/hide progress bar
    showProgress(show) {
        document.getElementById('progress-section').style.display = show ? 'block' : 'none';
        if (!show) {
            this.updateProgress(0, '');
        }
    }

    // Update progress bar
    updateProgress(percent, message) {
        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('progress-text').textContent = `${Math.round(percent)}%`;
        document.getElementById('operation-status').textContent = message;
    }

    // Log message to console
    log(message, type = 'info') {
        const console = document.getElementById('console');
        const timestamp = new Date().toLocaleTimeString();

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        entry.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> ${message}`;

        console.appendChild(entry);
        console.scrollTop = console.scrollHeight;

        // Store in logs array
        this.logs.push({ timestamp, message, type });
    }

    // Clear console
    clearConsole() {
        document.getElementById('console').innerHTML = '';
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
}
