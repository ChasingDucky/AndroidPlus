// WebADB Library Loader
// This module imports WebADB libraries and exposes them as global variables
// Works with both Vite (npm) and CDN (importmap)

try {
    // Try to import WebADB libraries
    const { Adb } = await import('@yume-chan/adb');
    const { AdbDaemonWebUsbDeviceManager } = await import('@yume-chan/adb-daemon-webusb');
    const { AdbWebCredentialStore } = await import('@yume-chan/adb-credential-web');

    // Expose as globals for webadb-manager.js
    window.Adb = Adb;
    window.AdbDaemonWebUsbDevice = {
        requestDevice: async () => {
            const manager = new AdbDaemonWebUsbDeviceManager();
            return await manager.requestDevice();
        }
    };
    window.AdbCredentialStore = AdbWebCredentialStore;

    console.log('✅ WebADB libraries loaded successfully');
} catch (error) {
    console.warn('⚠️ WebADB libraries not available:', error.message);
    console.log('💡 Run: npm install && npm run dev for full ADB support');
}
