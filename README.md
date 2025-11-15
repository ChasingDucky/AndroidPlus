# AndroidPlus - Universal Android Web Flasher

A universal web-based flashing tool for Android devices, inspired by Google's Pixel Flash Tool.

## Features

- 🔌 **WebUSB/WebADB Support**: Connect to Android devices directly from your browser
- 📱 **Universal Device Support**: Works with any Android device that supports ADB
- 🔍 **Device Detection**: Automatically detects device model, manufacturer, and Android version
- 📦 **Fastboot Flashing**: Flash system images, boot images, recovery, and more
- 📊 **Progress Tracking**: Real-time progress updates during flashing
- 🛡️ **Safe Operations**: Built-in safety checks and confirmations
- 📝 **Detailed Logging**: Complete log of all operations

## Requirements

- A modern browser with WebUSB support (Chrome, Edge, Opera)
- An Android device with USB debugging enabled
- Developer mode enabled on the Android device

## Usage

1. Open `index.html` in a compatible browser
2. Enable USB debugging on your Android device
3. Click "Connect Device" and select your device
4. Choose the operation you want to perform
5. Follow the on-screen instructions

## Supported Operations

- Flash system images (boot, system, vendor, etc.)
- Reboot to bootloader/fastboot
- Reboot to recovery
- Unlock/Lock bootloader
- Erase partitions
- Get device information

## Security

This tool runs entirely in your browser. No data is sent to external servers. All operations are performed locally between your browser and your Android device.

## Browser Compatibility

- ✅ Chrome 61+
- ✅ Edge 79+
- ✅ Opera 48+
- ❌ Firefox (no WebUSB support)
- ❌ Safari (no WebUSB support)

## License

MIT License

## Disclaimer

Flashing your device may void your warranty. Use this tool at your own risk. Always backup your data before flashing.
