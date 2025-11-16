// WebADB Integration Module
// Uses @yume-chan/adb library for full ADB protocol support

class WebADBManager {
    constructor(logCallback) {
        this.log = logCallback;
        this.adb = null;
        this.device = null;
        this.credentialStore = null;
    }

    // Check if WebADB library is loaded
    isAvailable() {
        return typeof Adb !== 'undefined' &&
               typeof AdbDaemonWebUsbDevice !== 'undefined';
    }

    // Initialize WebADB with credentials
    async initialize() {
        if (!this.isAvailable()) {
            throw new Error('WebADB library not loaded. Run: npm install && npm run dev');
        }

        try {
            // Create credential store for authentication
            this.credentialStore = new AdbCredentialStore();
            this.log('WebADB initialized', 'success');
        } catch (error) {
            this.log(`WebADB init error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Connect to device
    async connect() {
        try {
            this.log('Requesting WebUSB device...', 'info');

            // Request device
            const usbDevice = await AdbDaemonWebUsbDevice.requestDevice();
            this.log(`Device selected: ${usbDevice.name}`, 'success');

            // Create ADB connection
            this.device = await usbDevice.connect();
            this.log('USB connection established', 'success');

            // Create ADB client with authentication
            this.adb = await Adb.authenticate(
                this.device,
                this.credentialStore,
                undefined
            );

            this.log('ADB authenticated successfully!', 'success');
            return true;
        } catch (error) {
            this.log(`WebADB connection error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Execute shell command
    async shell(command) {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            const output = await this.adb.subprocess.shell(command).text();
            return output;
        } catch (error) {
            throw new Error(`Shell command failed: ${error.message}`);
        }
    }

    // List files
    async listFiles(path) {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            const sync = await this.adb.sync();
            const files = await sync.opendir(path);
            await sync.close();
            return files;
        } catch (error) {
            throw new Error(`List files failed: ${error.message}`);
        }
    }

    // Push file to device
    async pushFile(localFile, remotePath, onProgress) {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            const sync = await this.adb.sync();

            // Read file
            const arrayBuffer = await localFile.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);

            // Push to device
            await sync.write(remotePath, data, undefined, undefined, (progress) => {
                if (onProgress) {
                    onProgress(progress);
                }
            });

            await sync.close();
            return true;
        } catch (error) {
            throw new Error(`Push file failed: ${error.message}`);
        }
    }

    // Pull file from device
    async pullFile(remotePath, onProgress) {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            const sync = await this.adb.sync();

            const data = await sync.read(remotePath, (progress) => {
                if (onProgress) {
                    onProgress(progress);
                }
            });

            await sync.close();
            return data;
        } catch (error) {
            throw new Error(`Pull file failed: ${error.message}`);
        }
    }

    // Install APK
    async installAPK(apkFile, onProgress) {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            // Push APK to temp location
            const tempPath = `/data/local/tmp/${apkFile.name}`;
            await this.pushFile(apkFile, tempPath, onProgress);

            // Install via pm
            const result = await this.shell(`pm install -r ${tempPath}`);

            // Clean up
            await this.shell(`rm ${tempPath}`);

            return result.includes('Success');
        } catch (error) {
            throw new Error(`APK install failed: ${error.message}`);
        }
    }

    // Get device properties
    async getDeviceInfo() {
        if (!this.adb) {
            throw new Error('Not connected to device');
        }

        try {
            const [model, manufacturer, android, build, sdk] = await Promise.all([
                this.shell('getprop ro.product.model'),
                this.shell('getprop ro.product.manufacturer'),
                this.shell('getprop ro.build.version.release'),
                this.shell('getprop ro.build.display.id'),
                this.shell('getprop ro.build.version.sdk')
            ]);

            return {
                model: model.trim(),
                manufacturer: manufacturer.trim(),
                androidVersion: android.trim(),
                buildId: build.trim(),
                sdkVersion: sdk.trim()
            };
        } catch (error) {
            throw new Error(`Get device info failed: ${error.message}`);
        }
    }

    // Disconnect
    async disconnect() {
        try {
            if (this.adb) {
                await this.adb.close();
                this.adb = null;
            }
            if (this.device) {
                await this.device.close();
                this.device = null;
            }
            this.log('WebADB disconnected', 'info');
        } catch (error) {
            this.log(`Disconnect error: ${error.message}`, 'error');
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebADBManager;
}
