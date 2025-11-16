# AndroidPlus - Universal Android Web Flasher

> **Version 2.0** - A comprehensive web-based Android device management platform

A universal web-based flashing and device management tool for Android devices, inspired by Google's Pixel Flash Tool. AndroidPlus goes beyond basic flashing to provide a complete device management suite directly in your browser.

## 🌟 Features

### Core Capabilities
- 🔌 **WebUSB/WebADB Support**: Connect to Android devices directly from your browser
- 📱 **Universal Device Support**: Works with any Android device that supports ADB/Fastboot
- 🔍 **Device Detection**: Automatically detects device model, manufacturer, and Android version
- 📦 **Fastboot Flashing**: Flash system images, boot images, recovery, and more
- 📊 **Progress Tracking**: Real-time progress updates during operations
- 🛡️ **Safe Operations**: Built-in safety checks and confirmations
- 📝 **Detailed Logging**: Complete log of all operations

### Advanced Features (v2.0)

#### 📁 File Manager
- Browse device file system with intuitive UI
- Navigate directories with breadcrumb trail
- File operations: rename, delete, upload, download
- Create folders directly on device
- View file details (size, permissions, date)
- File type icons for easy identification

#### 📱 App Manager
- List all installed applications (user & system)
- Filter and search apps
- Batch operations:
  - Uninstall multiple apps at once
  - Enable/disable apps
  - Clear app data
  - Force stop applications
- View detailed package information
- Install APK files from browser
- Launch apps remotely

#### 🔄 Batch Operations & Scripting
- Visual script editor for automation
- Pre-built templates:
  - Flash complete ROMs
  - Debloat devices
  - Performance optimization
  - Backup workflows
- Create custom scripts with:
  - Flash operations
  - ADB commands
  - Reboot sequences
  - Timed delays
- Save and load scripts (JSON format)
- Step-by-step execution tracking

#### 🎯 Device Presets
- Pre-configured settings for popular devices:
  - Google Pixel series
  - Samsung Galaxy devices
  - Xiaomi smartphones
  - OnePlus devices
  - Motorola phones
- Automatic device detection and recommendations
- Device-specific flashing procedures
- Built-in tips and warnings
- Create custom presets
- Generate flash scripts from presets

#### 🛠️ Enhanced Tools
- System information (battery, memory, CPU)
- Screenshot capture
- Screen recording
- File push/pull operations
- Advanced ADB command execution

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

## 📋 Supported Operations

### Fastboot Operations
- Flash system images (boot, system, vendor, recovery, vbmeta, dtbo, etc.)
- Erase partitions
- Format partitions
- Unlock/Lock bootloader
- Reboot to bootloader/recovery/system
- Get device variables
- Slot management (for A/B devices)

### ADB Operations
- Execute shell commands
- List and manage packages
- File system navigation
- File upload/download
- Application management
- System information retrieval
- Screenshot and recording

### Advanced Operations
- Scripted batch flashing
- Multi-step automated workflows
- Device-specific procedures
- Backup and restore
- Performance optimization

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

## 📂 Project Structure

```
AndroidPlus/
├── index.html              # Main application interface
├── styles.css              # Complete styling (~990 lines)
├── main.js                 # Core application logic
├── adb-protocol.js         # ADB/Fastboot protocol implementation
├── file-manager.js         # File system browser
├── app-manager.js          # Application management
├── batch-operations.js     # Script automation system
├── device-presets.js       # Device configurations
├── README.md               # This file
├── CHANGELOG.md            # Version history
├── USAGE.md                # Detailed usage guide
├── TECHNICAL.md            # Technical documentation
├── package.json            # Project metadata
├── vite.config.js          # Build configuration
└── .gitignore              # Git ignore rules
```

## 🚀 Quick Start

### Option 1: Direct File Access
1. Download or clone this repository
2. Open `index.html` in Chrome, Edge, or Opera
3. Connect your Android device via USB
4. Click "Connect Device" and start using!

### Option 2: Development Server (Recommended)
```bash
npm install
npm run dev
```
The app will open at `http://localhost:3000`

### Option 3: Production Build
```bash
npm install
npm run build
npm run preview
```

## 📖 Documentation

- **[USAGE.md](USAGE.md)** - Complete user guide with tutorials
- **[TECHNICAL.md](TECHNICAL.md)** - Technical documentation and API reference
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates

## 🎓 Tutorials

### Flash a Custom ROM
1. Load device preset or create custom configuration
2. Use batch operations template "Flash Full ROM"
3. Select image files for each partition
4. Review script and execute

### Clean Up Bloatware
1. Go to App Manager tab
2. Filter by "System Apps"
3. Select unwanted apps
4. Click "Uninstall Selected" or "Disable Selected"

### Browse Device Files
1. Navigate to File Manager tab
2. Browse folders like /sdcard, /system, etc.
3. Upload, download, or organize files
4. Create folders as needed

### Automate Device Setup
1. Go to Batch Operations tab
2. Create new script or load template
3. Add steps for your workflow
4. Save script for future use

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional device presets
- More batch operation templates
- Protocol enhancements
- UI/UX improvements
- Documentation translations
- Bug fixes

## 📜 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

Flashing your device may void your warranty and can brick your device if done incorrectly. Use this tool at your own risk. Always backup your data before performing any operations.

This tool is for educational and development purposes. Always ensure you have proper backups and understand the risks involved in modifying your device.

## 🙏 Acknowledgments

- Inspired by [Google Pixel Flash Tool](https://flash.android.com)
- WebUSB API by W3C
- Android Debug Bridge (ADB) by Google
- Community contributions and feedback

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/AndroidPlus/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/AndroidPlus/discussions)
- Documentation: See USAGE.md and TECHNICAL.md

---

**Made with ❤️ for the Android community**
