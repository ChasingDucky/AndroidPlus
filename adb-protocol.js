// ADB Protocol Library
// More complete implementation of ADB protocol

class ADBProtocol {
    constructor(device, endpointIn, endpointOut) {
        this.device = device;
        this.endpointIn = endpointIn;
        this.endpointOut = endpointOut;

        // ADB Protocol constants
        this.A_SYNC = 0x434e5953;
        this.A_CNXN = 0x4e584e43;
        this.A_OPEN = 0x4e45504f;
        this.A_OKAY = 0x59414b4f;
        this.A_CLSE = 0x45534c43;
        this.A_WRTE = 0x45545257;
        this.A_AUTH = 0x48545541;

        this.VERSION = 0x01000000;
        this.MAX_PAYLOAD = 4096;
        this.localId = 1;
    }

    // Calculate checksum for ADB message
    checksum(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum & 0xFFFFFFFF;
    }

    // Create ADB message packet
    createMessage(command, arg0, arg1, data) {
        const dataArray = data ? new TextEncoder().encode(data) : new Uint8Array(0);
        const message = new ArrayBuffer(24 + dataArray.length);
        const view = new DataView(message);

        view.setUint32(0, command, true);
        view.setUint32(4, arg0, true);
        view.setUint32(8, arg1, true);
        view.setUint32(12, dataArray.length, true);
        view.setUint32(16, this.checksum(dataArray), true);
        view.setUint32(20, command ^ 0xffffffff, true);

        if (dataArray.length > 0) {
            new Uint8Array(message, 24).set(dataArray);
        }

        return new Uint8Array(message);
    }

    // Parse ADB message
    parseMessage(buffer) {
        const view = new DataView(buffer);
        return {
            command: view.getUint32(0, true),
            arg0: view.getUint32(4, true),
            arg1: view.getUint32(8, true),
            dataLength: view.getUint32(12, true),
            checksum: view.getUint32(16, true),
            magic: view.getUint32(20, true),
            data: buffer.byteLength > 24 ? new Uint8Array(buffer, 24) : new Uint8Array(0)
        };
    }

    // Send message and wait for response
    async sendMessage(command, arg0, arg1, data) {
        const message = this.createMessage(command, arg0, arg1, data);
        await this.device.transferOut(this.endpointOut, message);
    }

    // Receive message
    async receiveMessage(timeout = 5000) {
        const result = await this.device.transferIn(this.endpointIn, this.MAX_PAYLOAD + 24);
        return this.parseMessage(result.data.buffer);
    }

    // Connect to ADB
    async connect() {
        const systemIdentity = `host::features=shell_v2,cmd,stat_v2,ls_v2,fixed_push_mkdir,apex,abb,fixed_push_symlink_timestamp,abb_exec,remount_shell,track_app,sendrecv_v2,sendrecv_v2_brotli,sendrecv_v2_lz4,sendrecv_v2_zstd,sendrecv_v2_dry_run_send`;

        await this.sendMessage(this.A_CNXN, this.VERSION, this.MAX_PAYLOAD, systemIdentity);
        const response = await this.receiveMessage();

        if (response.command === this.A_AUTH) {
            // TODO: Handle authentication
            throw new Error('Authentication required - not yet implemented');
        }

        if (response.command !== this.A_CNXN) {
            throw new Error('Failed to connect to ADB');
        }

        return new TextDecoder().decode(response.data);
    }

    // Open a service
    async openService(service) {
        const localId = this.localId++;
        await this.sendMessage(this.A_OPEN, localId, 0, service);

        const response = await this.receiveMessage();
        if (response.command !== this.A_OKAY) {
            throw new Error(`Failed to open service: ${service}`);
        }

        return {
            localId: localId,
            remoteId: response.arg0
        };
    }

    // Execute shell command
    async shell(command) {
        const connection = await this.openService(`shell:${command}`);

        // Wait for WRTE with output
        const response = await this.receiveMessage();

        // Send OKAY to acknowledge
        await this.sendMessage(this.A_OKAY, connection.localId, connection.remoteId);

        let output = '';
        if (response.command === this.A_WRTE) {
            output = new TextDecoder().decode(response.data);
        }

        // Wait for close
        const closeMsg = await this.receiveMessage();
        if (closeMsg.command === this.A_CLSE) {
            await this.sendMessage(this.A_CLSE, connection.localId, connection.remoteId);
        }

        return output;
    }

    // Get device properties
    async getprop(prop) {
        const output = await this.shell(`getprop ${prop}`);
        return output.trim();
    }

    // List files in directory
    async ls(path) {
        const output = await this.shell(`ls -la "${path}"`);
        return this.parseLsOutput(output);
    }

    // Parse ls output
    parseLsOutput(output) {
        const lines = output.split('\n').filter(line => line.trim());
        const files = [];

        for (const line of lines) {
            if (line.startsWith('total')) continue;

            const parts = line.split(/\s+/);
            if (parts.length < 8) continue;

            files.push({
                permissions: parts[0],
                links: parseInt(parts[1]),
                owner: parts[2],
                group: parts[3],
                size: parseInt(parts[4]),
                date: `${parts[5]} ${parts[6]}`,
                name: parts.slice(7).join(' '),
                isDirectory: parts[0].startsWith('d'),
                isSymlink: parts[0].startsWith('l')
            });
        }

        return files;
    }

    // List installed packages
    async listPackages() {
        const output = await this.shell('pm list packages');
        return output.split('\n')
            .filter(line => line.startsWith('package:'))
            .map(line => line.substring(8).trim());
    }

    // Get package info
    async getPackageInfo(packageName) {
        const output = await this.shell(`dumpsys package ${packageName}`);
        return this.parsePackageInfo(output);
    }

    // Parse package info
    parsePackageInfo(output) {
        const info = {
            versionName: '',
            versionCode: '',
            firstInstallTime: '',
            lastUpdateTime: '',
            installedPermissions: []
        };

        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('versionName=')) {
                info.versionName = line.split('versionName=')[1]?.split(' ')[0] || '';
            }
            if (line.includes('versionCode=')) {
                info.versionCode = line.split('versionCode=')[1]?.split(' ')[0] || '';
            }
            if (line.includes('firstInstallTime=')) {
                info.firstInstallTime = line.split('firstInstallTime=')[1]?.trim() || '';
            }
            if (line.includes('lastUpdateTime=')) {
                info.lastUpdateTime = line.split('lastUpdateTime=')[1]?.trim() || '';
            }
        }

        return info;
    }

    // Install APK
    async installAPK(apkData, onProgress) {
        // This would require implementing ADB sync protocol
        // For now, simplified placeholder
        throw new Error('APK installation via WebADB not yet fully implemented');
    }

    // Uninstall package
    async uninstall(packageName) {
        const output = await this.shell(`pm uninstall ${packageName}`);
        return output.includes('Success');
    }

    // Get device info
    async getDeviceInfo() {
        const [model, manufacturer, androidVersion, buildId, sdk, serial, brand, device, board, hardware] = await Promise.all([
            this.getprop('ro.product.model'),
            this.getprop('ro.product.manufacturer'),
            this.getprop('ro.build.version.release'),
            this.getprop('ro.build.display.id'),
            this.getprop('ro.build.version.sdk'),
            this.getprop('ro.serialno'),
            this.getprop('ro.product.brand'),
            this.getprop('ro.product.device'),
            this.getprop('ro.product.board'),
            this.getprop('ro.hardware')
        ]);

        return {
            model,
            manufacturer,
            androidVersion,
            buildId,
            sdk,
            serial,
            brand,
            device,
            board,
            hardware
        };
    }

    // Get battery info
    async getBatteryInfo() {
        const output = await this.shell('dumpsys battery');
        const info = {};

        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('level:')) info.level = line.split(':')[1]?.trim();
            if (line.includes('temperature:')) info.temperature = line.split(':')[1]?.trim();
            if (line.includes('voltage:')) info.voltage = line.split(':')[1]?.trim();
            if (line.includes('status:')) info.status = line.split(':')[1]?.trim();
            if (line.includes('health:')) info.health = line.split(':')[1]?.trim();
        }

        return info;
    }

    // Get memory info
    async getMemoryInfo() {
        const output = await this.shell('cat /proc/meminfo');
        const info = {};

        const lines = output.split('\n');
        for (const line of lines) {
            const [key, value] = line.split(':');
            if (key && value) {
                info[key.trim()] = value.trim();
            }
        }

        return info;
    }

    // Get CPU info
    async getCPUInfo() {
        const output = await this.shell('cat /proc/cpuinfo');
        return output;
    }

    // Take screenshot and pull
    async screenshot() {
        await this.shell('screencap -p /sdcard/androidplus_screenshot.png');
        // TODO: Implement pull functionality
        return '/sdcard/androidplus_screenshot.png';
    }

    // Reboot device
    async reboot(mode = '') {
        if (mode) {
            await this.shell(`reboot ${mode}`);
        } else {
            await this.shell('reboot');
        }
    }
}

// Fastboot Protocol Library
class FastbootProtocol {
    constructor(device, endpointIn, endpointOut) {
        this.device = device;
        this.endpointIn = endpointIn;
        this.endpointOut = endpointOut;
        this.maxDownloadSize = 268435456; // 256MB default
    }

    // Send command and get response
    async sendCommand(command) {
        const encoder = new TextEncoder();
        const data = encoder.encode(command);

        await this.device.transferOut(this.endpointOut, data);

        const response = await this.device.transferIn(this.endpointIn, 64);
        const decoder = new TextDecoder();
        return decoder.decode(response.data);
    }

    // Get variable
    async getvar(variable) {
        const response = await this.sendCommand(`getvar:${variable}`);
        if (response.startsWith('OKAY')) {
            return response.substring(4).trim();
        }
        throw new Error(`Failed to get variable: ${variable}`);
    }

    // Get all variables
    async getAllVars() {
        const variables = {};
        const commonVars = [
            'version', 'version-bootloader', 'version-baseband', 'product',
            'serialno', 'secure', 'unlocked', 'max-download-size', 'partition-type',
            'partition-size', 'slot-count', 'current-slot'
        ];

        for (const varName of commonVars) {
            try {
                variables[varName] = await this.getvar(varName);
            } catch (e) {
                // Variable not supported
            }
        }

        return variables;
    }

    // Download data to device
    async download(data, onProgress) {
        const size = data.length;

        // Send download command with size
        const sizeHex = size.toString(16).padStart(8, '0');
        let response = await this.sendCommand(`download:${sizeHex}`);

        if (!response.startsWith('DATA')) {
            throw new Error('Device not ready for download');
        }

        // Send data in chunks
        const chunkSize = 4096;
        for (let i = 0; i < size; i += chunkSize) {
            const chunk = data.slice(i, Math.min(i + chunkSize, size));
            await this.device.transferOut(this.endpointOut, chunk);

            if (onProgress) {
                onProgress((i + chunk.length) / size * 100);
            }
        }

        // Wait for OKAY
        response = await this.device.transferIn(this.endpointIn, 64);
        const decoder = new TextDecoder();
        const result = decoder.decode(response.data);

        if (!result.startsWith('OKAY')) {
            throw new Error('Download failed');
        }

        return true;
    }

    // Flash partition
    async flash(partition, data, onProgress) {
        // Download data first
        await this.download(data, onProgress);

        // Flash the partition
        const response = await this.sendCommand(`flash:${partition}`);

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Flash failed: ${error}`);
        }

        return true;
    }

    // Erase partition
    async erase(partition) {
        const response = await this.sendCommand(`erase:${partition}`);

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Erase failed: ${error}`);
        }

        return true;
    }

    // Format partition
    async format(partition, fsType = 'ext4') {
        const response = await this.sendCommand(`format:${partition}:${fsType}`);

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Format failed: ${error}`);
        }

        return true;
    }

    // Unlock bootloader
    async unlock() {
        const response = await this.sendCommand('flashing unlock');

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Unlock failed: ${error}`);
        }

        return true;
    }

    // Lock bootloader
    async lock() {
        const response = await this.sendCommand('flashing lock');

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Lock failed: ${error}`);
        }

        return true;
    }

    // Reboot
    async reboot(target = '') {
        let command = 'reboot';
        if (target) {
            command += `-${target}`;
        }

        await this.sendCommand(command);
        return true;
    }

    // Continue boot
    async continue() {
        const response = await this.sendCommand('continue');
        return response.startsWith('OKAY');
    }

    // Set active slot
    async setActive(slot) {
        const response = await this.sendCommand(`set_active:${slot}`);

        if (!response.startsWith('OKAY')) {
            const error = response.substring(4);
            throw new Error(`Set active failed: ${error}`);
        }

        return true;
    }

    // OEM command
    async oem(command) {
        const response = await this.sendCommand(`oem ${command}`);
        return response;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADBProtocol, FastbootProtocol };
}
