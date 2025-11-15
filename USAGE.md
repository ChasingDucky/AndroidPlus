# AndroidPlus Usage Guide

## Getting Started

### Prerequisites

1. **Browser**: Chrome 61+, Edge 79+, or Opera 48+ (WebUSB support required)
2. **Android Device**: USB Debugging enabled
3. **USB Cable**: Quality data cable (not charge-only)

### Enable USB Debugging on Android

1. Go to **Settings** > **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings** > **Developer Options**
4. Enable **USB Debugging**
5. Enable **OEM Unlocking** (if you plan to unlock bootloader)

## Running the Application

### Option 1: Using Vite (Development)

```bash
npm install
npm run dev
```

The application will open at `http://localhost:3000`

### Option 2: Direct File Access

Simply open `index.html` in a compatible browser. Note: Some features may not work due to CORS restrictions.

### Option 3: Simple HTTP Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## Connecting Your Device

1. Connect your Android device via USB
2. Click **"Connect Device"** button
3. Select your device from the browser popup
4. Allow USB debugging on your device when prompted
5. The device information will appear once connected

## Operations Guide

### Fastboot Operations

#### Flashing Images

1. Switch to **Fastboot** tab
2. Select the partition you want to flash (boot, system, vendor, etc.)
3. Click **"Select Image File"** and choose your .img file
4. Click **"Flash Image"**
5. Confirm the operation
6. Wait for the progress bar to complete

**Supported Partitions:**
- **boot**: Kernel and ramdisk
- **system**: Android OS
- **vendor**: Vendor-specific files
- **recovery**: Recovery partition
- **vbmeta**: Verified boot metadata
- **dtbo**: Device tree overlay
- **userdata**: User data (will erase all data!)

#### Quick Actions

- **Reboot to Bootloader**: Enter fastboot mode
- **Reboot to Recovery**: Enter recovery mode
- **Reboot System**: Normal reboot

#### Advanced Operations

⚠️ **WARNING: These operations can brick your device!**

- **Unlock Bootloader**: Enables custom ROM installation (erases all data)
- **Lock Bootloader**: Locks bootloader (may brick device with custom software)
- **Erase Partition**: Permanently erases selected partition

### ADB Commands

#### Custom Commands

1. Switch to **ADB Commands** tab
2. Enter your command in the text field
3. Click **"Execute"** or press Enter

Example commands:
```
shell getprop ro.build.version.release
shell pm list packages
shell dumpsys battery
shell wm size
```

#### Quick Commands

Use the preset buttons for common operations:
- **Get Properties**: View system properties
- **List Packages**: Show installed apps
- **Battery Info**: Display battery status
- **Screen Size**: Show screen resolution

### Tools

#### File Transfer

1. Switch to **Tools** tab
2. Click **"Push File to Device"**
3. Select your file
4. Enter destination path (e.g., `/sdcard/Download/`)
5. Click **"Push File"**

#### Screenshots

1. Click **"Take Screenshot"**
2. Screenshot is saved to `/sdcard/screenshot.png` on device
3. Use ADB pull to download:
   ```
   adb pull /sdcard/screenshot.png
   ```

#### Screen Recording

1. Click **"Start Recording"**
2. Perform actions on device
3. Click **"Stop Recording"**
4. Video is saved to `/sdcard/recording.mp4` on device

## Troubleshooting

### Device Not Detected

1. **Check USB Cable**: Use a quality data cable
2. **Enable USB Debugging**: Verify it's enabled in Developer Options
3. **Revoke USB Debugging**: Settings > Developer Options > Revoke USB Debugging Authorizations, then reconnect
4. **Try Different USB Port**: Some USB 3.0 ports may have issues
5. **Check Drivers**: On Windows, ensure ADB drivers are installed

### "WebUSB not supported" Error

- Use Chrome, Edge, or Opera browser
- Update your browser to the latest version
- Firefox and Safari do not support WebUSB

### Connection Drops

1. **Disable USB Sleep**: Some devices sleep USB connections
2. **Check Cable**: Poor quality cables can cause disconnections
3. **Keep Screen On**: Enable "Stay Awake" in Developer Options

### Fastboot Not Working

1. **Reboot to Bootloader**: Use the "Reboot to Bootloader" button
2. **Manual Boot**: Power off device, then hold Power + Volume Down
3. **Check Mode**: Device must be in fastboot mode for fastboot operations

### Flash Failed

1. **Verify Image**: Ensure image file is correct for your device
2. **Check Partition**: Select the correct partition
3. **Bootloader Unlocked**: Bootloader must be unlocked to flash partitions
4. **Battery Level**: Ensure battery is above 50%

## Safety Tips

### Before Flashing

✅ **DO:**
- Backup all important data
- Charge device to at least 50%
- Download correct firmware for your device model
- Verify image file checksums
- Read instructions carefully

❌ **DON'T:**
- Flash images from untrusted sources
- Flash incompatible images
- Disconnect device during flashing
- Ignore warnings and confirmations

### Bootloader Unlock Warning

Unlocking the bootloader will:
- **Erase all data** on your device
- **Void your warranty** in most cases
- **Disable secure features** like banking apps
- **Allow custom software** installation

### Recovery Options

If something goes wrong:
1. **Fastboot Mode**: Hold Power + Volume Down while booting
2. **Recovery Mode**: Use "Reboot to Recovery" or Power + Volume Up
3. **Flash Stock ROM**: Download official firmware and flash
4. **Seek Help**: Visit XDA Developers or device-specific forums

## Advanced Usage

### Batch Operations

For flashing multiple partitions, you can queue operations in the console.

### Custom ROM Installation

1. Unlock bootloader
2. Flash custom recovery (TWRP)
3. Wipe data/cache in recovery
4. Flash ROM zip in recovery
5. Flash GApps (optional)
6. Reboot

### Kernel Flashing

1. Reboot to bootloader
2. Flash boot partition with custom kernel
3. Reboot system

## Console Output

The console shows:
- **Info** (blue): General information
- **Success** (green): Successful operations
- **Warning** (orange): Warnings
- **Error** (red): Errors and failures

### Console Controls

- **Clear**: Clear console output
- **Download Log**: Save console log as text file

## Security & Privacy

- All operations run locally in your browser
- No data is sent to external servers
- USB debugging allows full device access - only use on trusted computers
- Always lock bootloader after installing custom software for production use

## Getting Help

- Check device-specific forums (XDA Developers)
- Review Android documentation
- Search for device-specific flashing guides
- Ask in Android communities

## License

MIT License - Use at your own risk. No warranty provided.
