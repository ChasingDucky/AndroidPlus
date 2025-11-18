# AndroidPlus API 文档

> 完整的 API 参考文档 - 版本 2.0

本文档详细介绍了 AndroidPlus 的所有 API 接口、类、方法和使用示例。

## 目录

- [核心类](#核心类)
  - [AndroidFlasher](#androidflasher)
  - [ADBProtocol](#adbprotocol)
  - [FastbootProtocol](#fastbootprotocol)
  - [WebADBManager](#webadbmanager)
- [文件管理器 API](#文件管理器-api)
  - [FileManager](#filemanager)
- [应用管理器 API](#应用管理器-api)
  - [AppManager](#appmanager)
- [批处理操作 API](#批处理操作-api)
  - [BatchOperations](#batchoperations)
- [设备预设 API](#设备预设-api)
  - [DevicePresets](#devicepresets)

---

## 核心类

### AndroidFlasher

主应用程序类，负责设备连接、USB 通信和操作协调。

#### 构造函数

```javascript
const flasher = new AndroidFlasher();
```

创建一个新的 AndroidFlasher 实例。自动初始化 UI 事件监听器。

#### 属性

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `device` | `USBDevice` \| `null` | WebUSB 设备对象 |
| `interfaceNumber` | `number` \| `null` | USB 接口编号 |
| `endpointIn` | `number` \| `null` | USB 输入端点 |
| `endpointOut` | `number` \| `null` | USB 输出端点 |
| `isConnected` | `boolean` | 连接状态 |
| `deviceMode` | `'adb'` \| `'fastboot'` \| `null` | 设备模式 |
| `adbProtocol` | `ADBProtocol` \| `null` | ADB 协议实例 |
| `fastbootProtocol` | `FastbootProtocol` \| `null` | Fastboot 协议实例 |
| `webADBManager` | `WebADBManager` \| `null` | WebADB 管理器实例 |
| `logs` | `Array<Object>` | 日志记录数组 |

#### 方法

##### `connectDevice()`

连接到 Android 设备。

```javascript
await flasher.connectDevice();
```

**返回值:** `Promise<void>`

**异常:**
- 连接失败时抛出错误

**流程:**
1. 请求 USB 设备（显示浏览器选择器）
2. 打开设备并声明接口
3. 检测设备模式（ADB 或 Fastboot）
4. 初始化相应的协议处理器
5. 如果是 ADB 模式，尝试使用 WebADB 进行认证
6. 获取设备信息

**示例:**
```javascript
try {
    await flasher.connectDevice();
    console.log('设备已连接:', flasher.deviceMode);
} catch (error) {
    console.error('连接失败:', error.message);
}
```

##### `disconnectDevice()`

断开设备连接。

```javascript
await flasher.disconnectDevice();
```

**返回值:** `Promise<void>`

**功能:**
- 释放 USB 接口
- 关闭设备连接
- 重置所有状态变量

##### `detectDeviceMode(interfaces)`

检测设备当前模式（ADB 或 Fastboot）。

```javascript
const mode = flasher.detectDeviceMode(device.configuration.interfaces);
```

**参数:**
- `interfaces` (Array): USB 接口数组

**返回值:** `'adb'` | `'fastboot'` | `null`

**检测逻辑:**
- 类代码 (Class Code): `0xFF`
- 子类代码 (Subclass Code): `0x42`
- 协议代码 (Protocol Code):
  - `0x01` = ADB 模式
  - `0x03` = Fastboot 模式

##### `executeRawShellCommand(command)`

执行原始 ADB shell 命令。

```javascript
const output = await flasher.executeRawShellCommand('getprop ro.build.version.release');
```

**参数:**
- `command` (string): 要执行的 shell 命令

**返回值:** `Promise<string>` - 命令输出

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证（否则会失败）

**异常:**
- 设备不在 ADB 模式时抛出错误
- 未认证时抛出错误

**示例:**
```javascript
try {
    const androidVersion = await flasher.executeRawShellCommand('getprop ro.build.version.release');
    console.log('Android 版本:', androidVersion);
} catch (error) {
    console.error('命令执行失败:', error.message);
}
```

##### `getDeviceInfo()`

获取设备详细信息。

```javascript
await flasher.getDeviceInfo();
```

**返回值:** `Promise<void>`

**功能:**
- 从 USB 设备获取基本信息（型号、制造商、序列号）
- 如果是 Fastboot 模式，获取 bootloader 变量
- 如果是 ADB 模式且有 WebADB，获取完整设备属性
- 更新 UI 显示设备信息

**获取的属性:**
- 设备型号 (Model)
- 制造商 (Manufacturer)
- 序列号 (Serial Number)
- Android 版本 (Android Version)
- 构建版本 (Build ID)
- SDK 版本 (SDK Version)

##### `flashImage()`

刷写镜像文件到设备分区。

```javascript
await flasher.flashImage();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 Fastboot 模式
- 需要选择镜像文件和目标分区

**支持的分区:**
- `boot` - 启动镜像
- `recovery` - 恢复镜像
- `system` - 系统镜像
- `vendor` - 供应商镜像
- `userdata` - 用户数据
- 自定义分区名称

**示例流程:**
1. 用户选择镜像文件
2. 用户选择目标分区
3. 显示确认对话框
4. 上传镜像数据
5. 执行刷写命令
6. 显示进度和结果

##### `rebootSystem()`

重启设备到系统。

```javascript
await flasher.rebootSystem();
```

**返回值:** `Promise<void>`

**模式支持:**
- Fastboot 模式: 使用 `fastboot reboot`
- ADB 模式（需要认证）: 使用 `adb reboot`

##### `rebootToBootloader()`

重启设备到 bootloader（Fastboot 模式）。

```javascript
await flasher.rebootToBootloader();
```

**返回值:** `Promise<void>`

##### `rebootToRecovery()`

重启设备到 Recovery 模式。

```javascript
await flasher.rebootToRecovery();
```

**返回值:** `Promise<void>`

##### `unlockBootloader()`

解锁设备 bootloader。

```javascript
await flasher.unlockBootloader();
```

**返回值:** `Promise<void>`

**警告:**
- 会清除所有用户数据
- 可能会使设备保修失效
- 需要用户确认

##### `lockBootloader()`

重新锁定设备 bootloader。

```javascript
await flasher.lockBootloader();
```

**返回值:** `Promise<void>`

**警告:**
- 会清除所有用户数据
- 需要用户确认

##### `erasePartition()`

擦除指定分区。

```javascript
await flasher.erasePartition();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 Fastboot 模式
- 需要用户指定分区名称

**警告:**
- 擦除系统分区会导致设备无法启动
- 需要用户确认

##### `takeScreenshot()`

截取设备屏幕截图。

```javascript
await flasher.takeScreenshot();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证

**功能:**
- 在设备上执行 `screencap -p /sdcard/AndroidPlus_screenshot.png`
- 截图保存在设备的 `/sdcard/` 目录

##### `startRecording()`

开始屏幕录制。

```javascript
await flasher.startRecording();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证

**功能:**
- 在设备上执行 `screenrecord /sdcard/AndroidPlus_recording.mp4 &`
- 录制文件保存在设备的 `/sdcard/` 目录

##### `stopRecording()`

停止屏幕录制。

```javascript
await flasher.stopRecording();
```

**返回值:** `Promise<void>`

**功能:**
- 发送 `SIGINT` 信号终止 `screenrecord` 进程

##### `pushFile()`

推送文件到设备。

```javascript
await flasher.pushFile();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证（使用 ADB sync 协议）

**功能:**
1. 显示文件选择对话框
2. 提示输入目标路径
3. 显示上传进度
4. 完成后显示成功消息

**示例使用:**
```javascript
// 用户选择本地文件，输入远程路径如 /sdcard/myfile.txt
await flasher.pushFile();
```

##### `showBatteryInfo()`

显示设备电池信息。

```javascript
await flasher.showBatteryInfo();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证

**显示信息:**
- 电池电量百分比
- 充电状态
- 电池健康状态
- 电池温度
- 电压

##### `showMemoryInfo()`

显示设备内存信息。

```javascript
await flasher.showMemoryInfo();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证

**显示信息:**
- 总内存
- 可用内存
- 已使用内存
- 缓存大小

##### `showCPUInfo()`

显示设备 CPU 信息。

```javascript
await flasher.showCPUInfo();
```

**返回值:** `Promise<void>`

**要求:**
- 设备必须处于 ADB 模式
- 需要 WebADB 认证

**显示信息:**
- CPU 型号
- CPU 架构
- CPU 核心数
- CPU 频率

##### `log(message, type)`

添加日志消息。

```javascript
flasher.log('操作成功', 'success');
```

**参数:**
- `message` (string): 日志消息
- `type` (string): 日志类型 - `'info'`, `'success'`, `'warning'`, `'error'`

**功能:**
- 添加到内部日志数组
- 在 UI 控制台显示
- 包含时间戳

##### `clearConsole()`

清空控制台日志。

```javascript
flasher.clearConsole();
```

**返回值:** `void`

##### `downloadLog()`

下载日志文件。

```javascript
flasher.downloadLog();
```

**返回值:** `void`

**功能:**
- 生成包含所有日志的文本文件
- 触发浏览器下载
- 文件名格式: `AndroidPlus_log_YYYYMMDD_HHMMSS.txt`

---

## ADBProtocol

ADB 协议处理类（基础实现，不包含认证）。

### 构造函数

```javascript
const adb = new ADBProtocol(device, endpointIn, endpointOut);
```

**参数:**
- `device` (USBDevice): WebUSB 设备对象
- `endpointIn` (number): USB 输入端点
- `endpointOut` (number): USB 输出端点

### 方法

#### `sendCommand(command)`

发送 ADB 命令。

```javascript
await adb.sendCommand('shell:ls /sdcard');
```

**参数:**
- `command` (string): ADB 命令字符串

**返回值:** `Promise<void>`

**注意:** 基础实现不支持认证，建议使用 WebADBManager。

---

## FastbootProtocol

Fastboot 协议处理类。

### 构造函数

```javascript
const fastboot = new FastbootProtocol(device, endpointIn, endpointOut);
```

**参数:**
- `device` (USBDevice): WebUSB 设备对象
- `endpointIn` (number): USB 输入端点
- `endpointOut` (number): USB 输出端点

### 方法

#### `sendCommand(command)`

发送 Fastboot 命令。

```javascript
const response = await fastboot.sendCommand('getvar product');
```

**参数:**
- `command` (string): Fastboot 命令

**返回值:** `Promise<string>` - 设备响应

**常用命令:**
- `getvar <variable>` - 获取变量值
- `flash <partition> <image>` - 刷写分区
- `erase <partition>` - 擦除分区
- `reboot` - 重启
- `reboot-bootloader` - 重启到 bootloader
- `oem unlock` - 解锁 bootloader
- `oem lock` - 锁定 bootloader

#### `getvar(variable)`

获取 Fastboot 变量值。

```javascript
const product = await fastboot.getvar('product');
const version = await fastboot.getvar('version-bootloader');
```

**参数:**
- `variable` (string): 变量名称

**返回值:** `Promise<string>` - 变量值

**常用变量:**
- `product` - 产品名称
- `variant` - 变体
- `version-bootloader` - Bootloader 版本
- `version-baseband` - 基带版本
- `serialno` - 序列号
- `secure` - 安全启动状态
- `unlocked` - Bootloader 解锁状态
- `max-download-size` - 最大下载大小
- `partition-size:<partition>` - 分区大小

#### `flash(partition, imageData, onProgress)`

刷写镜像到分区。

```javascript
const imageData = await file.arrayBuffer();
await fastboot.flash('boot', new Uint8Array(imageData), (progress) => {
    console.log(`进度: ${progress.percentage}%`);
});
```

**参数:**
- `partition` (string): 分区名称
- `imageData` (Uint8Array): 镜像数据
- `onProgress` (function): 进度回调函数

**进度回调参数:**
```javascript
{
    transferred: number,  // 已传输字节数
    total: number,        // 总字节数
    percentage: number    // 百分比 (0-100)
}
```

**返回值:** `Promise<void>`

#### `erase(partition)`

擦除分区。

```javascript
await fastboot.erase('userdata');
```

**参数:**
- `partition` (string): 分区名称

**返回值:** `Promise<void>`

#### `reboot(target)`

重启设备。

```javascript
await fastboot.reboot();           // 重启到系统
await fastboot.reboot('bootloader'); // 重启到 bootloader
await fastboot.reboot('recovery');   // 重启到 recovery
```

**参数:**
- `target` (string, 可选): 重启目标 - `'bootloader'`, `'recovery'`

**返回值:** `Promise<void>`

---

## WebADBManager

完整的 WebADB 库管理器，支持认证和高级功能。

### 构造函数

```javascript
const webADB = new WebADBManager(logCallback);
```

**参数:**
- `logCallback` (function): 日志回调函数
  ```javascript
  (message, type) => {
      console.log(`[${type}] ${message}`);
  }
  ```

### 属性

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `device` | `AdbDaemonWebUsbDevice` \| `null` | WebADB 设备对象 |
| `adb` | `Adb` \| `null` | ADB 连接实例 |
| `credentialStore` | `AdbCredentialStore` \| `null` | RSA 密钥凭证存储 |

### 方法

#### `isAvailable()`

检查 WebADB 库是否可用。

```javascript
if (webADB.isAvailable()) {
    console.log('WebADB 可用');
}
```

**返回值:** `boolean`

#### `initialize()`

初始化 WebADB 凭证存储。

```javascript
await webADB.initialize();
```

**返回值:** `Promise<void>`

**功能:**
- 创建 RSA 密钥凭证存储
- 用于 ADB 认证

#### `connect()`

连接到设备并进行认证。

```javascript
await webADB.connect();
```

**返回值:** `Promise<void>`

**流程:**
1. 显示 USB 设备选择器
2. 建立 USB 连接
3. 执行 RSA 密钥认证
4. 用户需在设备上确认授权

**异常:**
- 用户取消选择时抛出错误
- 认证失败时抛出错误

#### `disconnect()`

断开连接。

```javascript
await webADB.disconnect();
```

**返回值:** `Promise<void>`

#### `shell(command)`

执行 shell 命令。

```javascript
const output = await webADB.shell('pm list packages');
console.log('已安装应用:', output);
```

**参数:**
- `command` (string): Shell 命令

**返回值:** `Promise<string>` - 命令输出

**示例:**
```javascript
// 获取设备属性
const model = await webADB.shell('getprop ro.product.model');

// 列出文件
const files = await webADB.shell('ls -la /sdcard');

// 安装应用
await webADB.shell('pm install /sdcard/app.apk');
```

#### `pushFile(localFile, remotePath, onProgress)`

推送文件到设备。

```javascript
const file = document.querySelector('input[type="file"]').files[0];
await webADB.pushFile(file, '/sdcard/myfile.txt', (progress) => {
    console.log(`上传进度: ${progress.percentage}%`);
});
```

**参数:**
- `localFile` (File): 本地文件对象
- `remotePath` (string): 设备上的目标路径
- `onProgress` (function): 进度回调函数

**返回值:** `Promise<void>`

#### `pullFile(remotePath, onProgress)`

从设备拉取文件。

```javascript
const data = await webADB.pullFile('/sdcard/myfile.txt', (progress) => {
    console.log(`下载进度: ${progress.percentage}%`);
});

// 保存文件到本地
const blob = new Blob([data]);
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'myfile.txt';
a.click();
```

**参数:**
- `remotePath` (string): 设备上的文件路径
- `onProgress` (function): 进度回调函数

**返回值:** `Promise<Uint8Array>` - 文件数据

#### `installAPK(apkFile, onProgress)`

安装 APK 文件。

```javascript
const apkFile = document.querySelector('input[type="file"]').files[0];
await webADB.installAPK(apkFile, (progress) => {
    console.log(`安装进度: ${progress.percentage}%`);
});
```

**参数:**
- `apkFile` (File): APK 文件对象
- `onProgress` (function): 进度回调函数

**返回值:** `Promise<void>`

**流程:**
1. 上传 APK 到设备临时目录
2. 执行 `pm install` 命令
3. 清理临时文件

#### `getDeviceInfo()`

获取设备详细信息。

```javascript
const info = await webADB.getDeviceInfo();
console.log('设备信息:', info);
```

**返回值:** `Promise<Object>`

**返回对象结构:**
```javascript
{
    model: 'Redmi Note 12 Turbo',
    manufacturer: 'Xiaomi',
    androidVersion: '13',
    sdkVersion: '33',
    buildId: 'TKQ1.220905.001',
    serialNumber: 'abc123',
    brand: 'Redmi',
    device: 'marble',
    hardware: 'qcom'
}
```

---

## 文件管理器 API

### FileManager

设备文件系统管理类。

#### 构造函数

```javascript
const fileManager = new FileManager(webADBManager);
```

**参数:**
- `webADBManager` (WebADBManager): WebADB 管理器实例

#### 方法

##### `listDirectory(path)`

列出目录内容。

```javascript
const files = await fileManager.listDirectory('/sdcard');
```

**参数:**
- `path` (string): 目录路径

**返回值:** `Promise<Array<FileEntry>>`

**FileEntry 结构:**
```javascript
{
    name: 'photo.jpg',
    type: 'file',        // 'file' 或 'directory'
    size: 1024000,       // 字节
    permissions: 'rw-r--r--',
    owner: 'root',
    group: 'sdcard_rw',
    modified: '2025-01-15 12:30:00',
    path: '/sdcard/photo.jpg'
}
```

##### `navigateTo(path)`

导航到指定目录。

```javascript
await fileManager.navigateTo('/sdcard/Download');
```

**参数:**
- `path` (string): 目录路径

**返回值:** `Promise<void>`

**功能:**
- 更新当前路径
- 刷新文件列表
- 更新面包屑导航

##### `navigateUp()`

导航到上级目录。

```javascript
await fileManager.navigateUp();
```

**返回值:** `Promise<void>`

##### `renameFile(oldPath, newName)`

重命名文件或目录。

```javascript
await fileManager.renameFile('/sdcard/old.txt', 'new.txt');
```

**参数:**
- `oldPath` (string): 原路径
- `newName` (string): 新名称

**返回值:** `Promise<void>`

##### `deleteFile(path)`

删除文件或目录。

```javascript
await fileManager.deleteFile('/sdcard/unwanted.txt');
```

**参数:**
- `path` (string): 文件路径

**返回值:** `Promise<void>`

**警告:**
- 删除目录会递归删除所有内容
- 操作不可逆

##### `createDirectory(path, dirName)`

创建目录。

```javascript
await fileManager.createDirectory('/sdcard', 'MyFolder');
```

**参数:**
- `path` (string): 父目录路径
- `dirName` (string): 新目录名称

**返回值:** `Promise<void>`

##### `uploadFile(localFile, remotePath)`

上传文件到设备。

```javascript
const file = document.querySelector('input[type="file"]').files[0];
await fileManager.uploadFile(file, '/sdcard');
```

**参数:**
- `localFile` (File): 本地文件对象
- `remotePath` (string): 目标目录路径

**返回值:** `Promise<void>`

##### `downloadFile(remotePath)`

下载文件到本地。

```javascript
await fileManager.downloadFile('/sdcard/photo.jpg');
```

**参数:**
- `remotePath` (string): 设备上的文件路径

**返回值:** `Promise<void>`

**功能:**
- 从设备拉取文件
- 触发浏览器下载

---

## 应用管理器 API

### AppManager

设备应用管理类。

#### 构造函数

```javascript
const appManager = new AppManager(webADBManager);
```

**参数:**
- `webADBManager` (WebADBManager): WebADB 管理器实例

#### 方法

##### `listPackages(filter)`

列出已安装应用。

```javascript
const allApps = await appManager.listPackages('all');
const userApps = await appManager.listPackages('user');
const systemApps = await appManager.listPackages('system');
```

**参数:**
- `filter` (string): 过滤器
  - `'all'` - 所有应用
  - `'user'` - 仅用户应用
  - `'system'` - 仅系统应用
  - `'enabled'` - 仅启用的应用
  - `'disabled'` - 仅禁用的应用

**返回值:** `Promise<Array<PackageInfo>>`

**PackageInfo 结构:**
```javascript
{
    packageName: 'com.example.app',
    appName: 'Example App',
    version: '1.0.0',
    versionCode: 100,
    isSystemApp: false,
    isEnabled: true,
    installPath: '/data/app/com.example.app-1/base.apk',
    dataDir: '/data/data/com.example.app',
    size: 5242880  // 字节
}
```

##### `getPackageInfo(packageName)`

获取应用详细信息。

```javascript
const info = await appManager.getPackageInfo('com.android.chrome');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<PackageInfo>`

##### `uninstallPackage(packageName)`

卸载应用。

```javascript
await appManager.uninstallPackage('com.example.app');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

**注意:** 系统应用可能需要 root 权限

##### `batchUninstall(packageNames, onProgress)`

批量卸载应用。

```javascript
const packages = ['com.example.app1', 'com.example.app2'];
await appManager.batchUninstall(packages, (progress) => {
    console.log(`卸载进度: ${progress.current}/${progress.total}`);
});
```

**参数:**
- `packageNames` (Array<string>): 包名数组
- `onProgress` (function): 进度回调函数

**返回值:** `Promise<Object>` - 卸载结果

**返回对象:**
```javascript
{
    success: ['com.example.app1'],
    failed: ['com.example.app2'],
    total: 2
}
```

##### `enablePackage(packageName)`

启用应用。

```javascript
await appManager.enablePackage('com.example.app');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

##### `disablePackage(packageName)`

禁用应用。

```javascript
await appManager.disablePackage('com.example.app');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

**注意:** 禁用系统应用可能导致系统不稳定

##### `clearPackageData(packageName)`

清除应用数据。

```javascript
await appManager.clearPackageData('com.android.chrome');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

**警告:** 会删除应用所有数据、缓存和设置

##### `forceStop(packageName)`

强制停止应用。

```javascript
await appManager.forceStop('com.example.app');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

##### `launchApp(packageName)`

启动应用。

```javascript
await appManager.launchApp('com.android.chrome');
```

**参数:**
- `packageName` (string): 应用包名

**返回值:** `Promise<void>`

---

## 批处理操作 API

### BatchOperations

批处理脚本管理类。

#### 构造函数

```javascript
const batchOps = new BatchOperations(flasher);
```

**参数:**
- `flasher` (AndroidFlasher): AndroidFlasher 实例

#### 方法

##### `createScript(name, description)`

创建新脚本。

```javascript
const script = batchOps.createScript('My Script', 'Custom automation script');
```

**参数:**
- `name` (string): 脚本名称
- `description` (string): 脚本描述

**返回值:** `Script` - 脚本对象

**Script 结构:**
```javascript
{
    id: 'unique-id',
    name: 'My Script',
    description: 'Custom automation script',
    steps: [],
    createdAt: '2025-01-15T12:30:00Z'
}
```

##### `addStep(script, stepType, params)`

添加脚本步骤。

```javascript
batchOps.addStep(script, 'flash', {
    partition: 'boot',
    file: bootImageFile
});

batchOps.addStep(script, 'adb', {
    command: 'shell pm uninstall com.example.bloatware'
});

batchOps.addStep(script, 'reboot', {
    target: 'system'
});
```

**参数:**
- `script` (Script): 脚本对象
- `stepType` (string): 步骤类型
  - `'flash'` - 刷写分区
  - `'adb'` - ADB 命令
  - `'reboot'` - 重启
  - `'delay'` - 延时等待
- `params` (Object): 步骤参数

**步骤参数结构:**

**Flash 步骤:**
```javascript
{
    partition: 'boot',
    file: File  // 文件对象
}
```

**ADB 步骤:**
```javascript
{
    command: 'shell pm uninstall com.example.app'
}
```

**Reboot 步骤:**
```javascript
{
    target: 'system'  // 'system', 'bootloader', 'recovery'
}
```

**Delay 步骤:**
```javascript
{
    duration: 5000  // 毫秒
}
```

**返回值:** `void`

##### `executeScript(script, onProgress)`

执行脚本。

```javascript
await batchOps.executeScript(script, (progress) => {
    console.log(`步骤 ${progress.current}/${progress.total}: ${progress.stepName}`);
});
```

**参数:**
- `script` (Script): 脚本对象
- `onProgress` (function): 进度回调函数

**进度回调参数:**
```javascript
{
    current: 3,
    total: 10,
    stepName: 'Flash boot partition',
    percentage: 30
}
```

**返回值:** `Promise<Object>` - 执行结果

**返回对象:**
```javascript
{
    success: true,
    completedSteps: 10,
    failedSteps: 0,
    errors: []
}
```

##### `loadTemplate(templateName)`

加载预定义模板。

```javascript
const flashRomScript = batchOps.loadTemplate('flash-rom');
const debloatScript = batchOps.loadTemplate('debloat');
const optimizeScript = batchOps.loadTemplate('optimize');
```

**参数:**
- `templateName` (string): 模板名称
  - `'flash-rom'` - 完整 ROM 刷写
  - `'debloat'` - 设备精简
  - `'optimize'` - 性能优化
  - `'backup'` - 备份工作流

**返回值:** `Script` - 脚本对象

##### `saveScript(script)`

保存脚本到本地存储。

```javascript
batchOps.saveScript(script);
```

**参数:**
- `script` (Script): 脚本对象

**返回值:** `void`

##### `loadScript(scriptId)`

从本地存储加载脚本。

```javascript
const script = batchOps.loadScript('script-id');
```

**参数:**
- `scriptId` (string): 脚本 ID

**返回值:** `Script` - 脚本对象

##### `deleteScript(scriptId)`

删除保存的脚本。

```javascript
batchOps.deleteScript('script-id');
```

**参数:**
- `scriptId` (string): 脚本 ID

**返回值:** `void`

---

## 设备预设 API

### DevicePresets

设备预设配置管理类。

#### 构造函数

```javascript
const presets = new DevicePresets();
```

#### 方法

##### `getPreset(deviceName)`

获取设备预设配置。

```javascript
const pixelPreset = presets.getPreset('Google Pixel');
```

**参数:**
- `deviceName` (string): 设备名称

**支持的设备:**
- `'Google Pixel'`
- `'Samsung Galaxy'`
- `'Xiaomi'`
- `'OnePlus'`
- `'Motorola'`
- `'Generic'`

**返回值:** `Preset` - 预设对象

**Preset 结构:**
```javascript
{
    name: 'Google Pixel',
    manufacturer: 'Google',
    partitions: ['boot', 'system', 'vendor', 'product'],
    defaultCommands: [
        'fastboot flashing unlock',
        'fastboot flash boot boot.img'
    ],
    bloatwarePackages: [
        'com.google.android.apps.wellbeing'
    ],
    optimizations: {
        disableAnimations: true,
        reduceLogs: true
    }
}
```

##### `listPresets()`

列出所有可用预设。

```javascript
const allPresets = presets.listPresets();
```

**返回值:** `Array<Preset>`

##### `createCustomPreset(config)`

创建自定义预设。

```javascript
const customPreset = presets.createCustomPreset({
    name: 'My Device',
    manufacturer: 'Custom',
    partitions: ['boot', 'system'],
    defaultCommands: ['fastboot reboot']
});
```

**参数:**
- `config` (Object): 预设配置

**返回值:** `Preset`

##### `savePreset(preset)`

保存预设到本地存储。

```javascript
presets.savePreset(customPreset);
```

**参数:**
- `preset` (Preset): 预设对象

**返回值:** `void`

##### `applyPreset(preset, flasher)`

应用预设到设备。

```javascript
await presets.applyPreset(pixelPreset, flasher);
```

**参数:**
- `preset` (Preset): 预设对象
- `flasher` (AndroidFlasher): AndroidFlasher 实例

**返回值:** `Promise<void>`

**功能:**
- 自动配置分区选项
- 应用优化设置
- 执行预定义命令

---

## 事件系统

AndroidPlus 使用自定义事件系统进行模块间通信。

### 事件列表

| 事件名称 | 触发时机 | 事件数据 |
|---------|---------|---------|
| `device:connected` | 设备连接成功 | `{ mode: 'adb'\|'fastboot' }` |
| `device:disconnected` | 设备断开连接 | `null` |
| `flash:start` | 开始刷写操作 | `{ partition: string }` |
| `flash:progress` | 刷写进度更新 | `{ percentage: number }` |
| `flash:complete` | 刷写完成 | `{ partition: string }` |
| `script:start` | 脚本开始执行 | `{ scriptId: string }` |
| `script:progress` | 脚本进度更新 | `{ current: number, total: number }` |
| `script:complete` | 脚本执行完成 | `{ scriptId: string, success: boolean }` |

### 监听事件

```javascript
document.addEventListener('device:connected', (event) => {
    console.log('设备已连接:', event.detail.mode);
});
```

### 触发事件

```javascript
const event = new CustomEvent('flash:progress', {
    detail: { percentage: 50 }
});
document.dispatchEvent(event);
```

---

## 错误处理

### 错误类型

AndroidPlus 定义了以下错误类型:

#### `ConnectionError`

设备连接错误。

```javascript
try {
    await flasher.connectDevice();
} catch (error) {
    if (error instanceof ConnectionError) {
        console.error('连接失败:', error.message);
    }
}
```

#### `AuthenticationError`

ADB 认证错误。

```javascript
try {
    await webADB.connect();
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.error('认证失败，请在设备上确认授权');
    }
}
```

#### `FlashError`

刷写操作错误。

```javascript
try {
    await flasher.flashImage();
} catch (error) {
    if (error instanceof FlashError) {
        console.error('刷写失败:', error.partition, error.message);
    }
}
```

### 最佳实践

1. **始终使用 try-catch**
```javascript
try {
    await flasher.connectDevice();
    await flasher.flashImage();
} catch (error) {
    flasher.log(`错误: ${error.message}`, 'error');
}
```

2. **检查设备模式**
```javascript
if (flasher.deviceMode !== 'fastboot') {
    throw new Error('此操作需要 Fastboot 模式');
}
```

3. **验证参数**
```javascript
if (!partition || !imageFile) {
    throw new Error('缺少必需参数');
}
```

---

## 完整示例

### 示例 1: 连接设备并刷写 boot 镜像

```javascript
// 创建 AndroidFlasher 实例
const flasher = new AndroidFlasher();

async function flashBootImage() {
    try {
        // 连接设备
        await flasher.connectDevice();

        // 检查设备模式
        if (flasher.deviceMode !== 'fastboot') {
            throw new Error('请在 Fastboot 模式下连接设备');
        }

        // 选择镜像文件
        const fileInput = document.querySelector('#image-file');
        const bootImage = fileInput.files[0];

        if (!bootImage) {
            throw new Error('请选择 boot 镜像文件');
        }

        // 刷写镜像
        const imageData = await bootImage.arrayBuffer();
        await flasher.fastbootProtocol.flash('boot', new Uint8Array(imageData), (progress) => {
            console.log(`刷写进度: ${progress.percentage}%`);
        });

        console.log('刷写完成!');

        // 重启设备
        await flasher.rebootSystem();

    } catch (error) {
        console.error('操作失败:', error.message);
    }
}

flashBootImage();
```

### 示例 2: 使用 WebADB 批量卸载应用

```javascript
async function debloatDevice() {
    try {
        // 创建 WebADB 管理器
        const webADB = new WebADBManager((msg, type) => {
            console.log(`[${type}] ${msg}`);
        });

        // 初始化并连接
        await webADB.initialize();
        await webADB.connect();

        // 创建应用管理器
        const appManager = new AppManager(webADB);

        // 要卸载的 bloatware 列表
        const bloatware = [
            'com.facebook.system',
            'com.facebook.appmanager',
            'com.facebook.services',
            'com.google.android.apps.tachyon'
        ];

        // 批量卸载
        const result = await appManager.batchUninstall(bloatware, (progress) => {
            console.log(`进度: ${progress.current}/${progress.total}`);
        });

        console.log('卸载完成:', result);
        console.log('成功:', result.success);
        console.log('失败:', result.failed);

    } catch (error) {
        console.error('操作失败:', error.message);
    }
}

debloatDevice();
```

### 示例 3: 创建并执行自动化脚本

```javascript
async function automateROMFlash() {
    try {
        const flasher = new AndroidFlasher();
        const batchOps = new BatchOperations(flasher);

        // 连接设备
        await flasher.connectDevice();

        // 创建脚本
        const script = batchOps.createScript(
            'Flash Custom ROM',
            'Complete ROM flashing workflow'
        );

        // 添加步骤
        batchOps.addStep(script, 'flash', {
            partition: 'boot',
            file: bootImage
        });

        batchOps.addStep(script, 'flash', {
            partition: 'system',
            file: systemImage
        });

        batchOps.addStep(script, 'flash', {
            partition: 'vendor',
            file: vendorImage
        });

        batchOps.addStep(script, 'reboot', {
            target: 'system'
        });

        // 执行脚本
        const result = await batchOps.executeScript(script, (progress) => {
            console.log(`步骤 ${progress.current}/${progress.total}: ${progress.stepName}`);
            console.log(`总进度: ${progress.percentage}%`);
        });

        console.log('脚本执行完成:', result);

    } catch (error) {
        console.error('操作失败:', error.message);
    }
}

automateROMFlash();
```

---

## 浏览器兼容性

| 浏览器 | 版本 | WebUSB 支持 | 备注 |
|--------|------|------------|------|
| Chrome | 61+ | ✅ | 完全支持 |
| Edge | 79+ | ✅ | 完全支持 |
| Opera | 48+ | ✅ | 完全支持 |
| Firefox | - | ❌ | 不支持 WebUSB |
| Safari | - | ❌ | 不支持 WebUSB |

---

## 版本历史

### v2.0.0 (当前版本)
- ✅ 集成 WebADB 库
- ✅ 完整的 ADB 认证支持
- ✅ 文件管理器
- ✅ 应用管理器
- ✅ 批处理操作
- ✅ 设备预设
- ✅ 自动化脚本

### v1.0.0
- ✅ 基础 WebUSB 连接
- ✅ Fastboot 操作
- ✅ 简单的 ADB 命令执行

---

## 许可证

MIT License

---

## 支持与反馈

如有问题或建议，请访问:
- GitHub Issues: https://github.com/your-repo/AndroidPlus/issues
- 文档: https://androidplus.dev/docs

---

**最后更新:** 2025-01-15
