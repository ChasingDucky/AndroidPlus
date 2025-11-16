# 故障排除指南 / Troubleshooting Guide

## 🔧 常见问题解决方案

### 问题 1: ADB 传输错误

**症状**:
```
Shell command error: ADB communication failed:
Failed to execute 'transferIn/transferOut' on 'USBDevice':
A transfer error has occurred / The device was disconnected.
```

**原因**:
- ADB 模式需要认证（RSA 密钥交换）
- 当前版本的 ADB 协议实现不完整
- 某些设备（如小米、OPPO）需要额外的认证步骤

**解决方案**:

#### 方案 A: 使用 Fastboot 模式（推荐）

AndroidPlus 目前对 **Fastboot 模式**支持最好！

1. **进入 Fastboot 模式**：
   ```
   方法 1: 如果设备能开机
   - 关机
   - 同时按住 电源键 + 音量减键
   - 直到看到 Fastboot 或兔子修安卓图标

   方法 2: 通过 adb 命令（如果已授权）
   - adb reboot bootloader
   ```

2. **连接 AndroidPlus**：
   - 设备进入 Fastboot 模式后
   - 在 AndroidPlus 中点击 "Connect Device"
   - 选择你的设备
   - 现在可以正常刷写分区了！

#### 方案 B: 使用命令行 ADB

对于需要 ADB 的操作（如文件管理、应用管理），暂时使用命令行：

```bash
# 检查设备连接
adb devices

# 执行 shell 命令
adb shell getprop ro.build.version.release

# 文件操作
adb push local.file /sdcard/
adb pull /sdcard/remote.file

# 应用管理
adb install app.apk
adb uninstall com.package.name

# 截图
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### 问题 2: 设备模式检测

**如何确认设备模式**:

查看 AndroidPlus 控制台输出：
```
Device mode detected: adb    # ADB 模式（需要认证）
Device mode detected: fastboot  # Fastboot 模式（完全支持）
```

**ADB 模式特征**:
- 设备正常开机，屏幕可见
- 已启用 USB 调试
- 连接时显示 "ADB Mode (Auth Required)"

**Fastboot 模式特征**:
- 屏幕显示 Fastboot 或兔子图标
- 无法正常使用设备
- 可以刷写分区、解锁 bootloader

### 问题 3: Redmi/Xiaomi 设备特别说明

**小米设备需要额外步骤**:

1. **Bootloader 解锁**:
   - 访问 [unlock.update.miui.com](https://unlock.update.miui.com)
   - 绑定账号并等待 168 小时
   - 使用官方解锁工具解锁

2. **使用 Fastboot 模式**:
   - 小米设备的 ADB 认证特别严格
   - 强烈建议使用 Fastboot 模式操作

3. **刷机注意事项**:
   - 检查防回滚版本（Anti-Rollback）
   - 不要刷写低版本系统
   - 使用官方 ROM 或可信来源的第三方 ROM

### 问题 4: 操作被禁用

**症状**: 点击按钮没有反应，或显示错误提示

**检查清单**:

1. **确认设备模式**:
   ```
   ✅ Fastboot 操作 → 需要 Fastboot 模式
   ✅ ADB 命令 → 需要 ADB 模式（暂不支持）
   ✅ 文件管理 → 需要 ADB 模式（暂不支持）
   ✅ 应用管理 → 需要 ADB 模式（暂不支持）
   ```

2. **查看控制台提示**:
   - 所有操作都会在控制台输出详细信息
   - 包括错误原因和建议解决方案

3. **确认设备连接**:
   - 连接状态显示 "Connected"
   - 设备信息已加载

### 问题 5: 刷机失败

**安全检查**:

1. **镜像文件检查**:
   - ✅ 文件来源可信
   - ✅ 适配你的设备型号
   - ✅ 分区名称正确
   - ✅ 文件大小合理（不为空）

2. **设备状态**:
   - ✅ 电量 > 50%
   - ✅ Bootloader 已解锁（如需刷写 system 等分区）
   - ✅ 在 Fastboot 模式

3. **操作前准备**:
   - ✅ 备份重要数据
   - ✅ 阅读 ROM 刷写说明
   - ✅ 准备好官方线刷包（救砖用）

**常见刷机错误**:

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| FAILED (remote: Partition doesn't exist) | 分区不存在 | 检查设备分区表，使用正确的分区名 |
| FAILED (remote: Not allowed in Lock State) | Bootloader 锁定 | 解锁 Bootloader |
| FAILED (remote: Download is not supported) | 不支持下载 | 尝试小分区或检查设备状态 |
| Device disconnected | 设备断开 | 检查 USB 线缆，重新连接 |

### 问题 6: WebUSB 不工作

**浏览器要求**:

✅ **支持的浏览器**:
- Chrome 61+ (推荐)
- Edge 79+
- Opera 48+

❌ **不支持的浏览器**:
- Firefox (无 WebUSB API)
- Safari (无 WebUSB API)

**HTTPS 要求**:
- 使用 `http://localhost` ✅
- 使用 `https://` ✅
- 使用 `http://127.0.0.1` ✅
- 使用 `file:///` ❌ (功能受限)

### 问题 7: 连接后立即断开

**可能原因**:

1. **USB 驱动问题**:
   ```bash
   # Windows: 安装 ADB 驱动
   # 使用 Google USB Driver 或设备厂商驱动

   # macOS/Linux: 通常不需要额外驱动
   ```

2. **USB 线缆问题**:
   - 使用原装数据线
   - 避免使用 USB Hub
   - 尝试不同的 USB 接口

3. **设备省电设置**:
   - 开发者选项 > "Stay awake" (保持唤醒)
   - 关闭 USB 选择性暂停

4. **USB 模式选择**:
   - 某些设备连接时会询问 USB 用途
   - 选择 "文件传输 (MTP)" 或 "USB 调试"

## 🔍 调试技巧

### 启用详细日志

1. **浏览器开发者工具**:
   ```
   按 F12 打开
   查看 Console 标签
   观察详细错误信息
   ```

2. **AndroidPlus 控制台**:
   - 应用底部的 "Console Output"
   - 显示所有操作和错误
   - 可以下载日志文件

### 检查 USB 连接

```bash
# 列出 USB 设备
lsusb              # Linux
system_profiler SPUSBDataType  # macOS

# 检查 ADB 连接（如果已授权）
adb devices -l

# 检查 Fastboot 连接
fastboot devices
```

### 验证设备状态

在 Fastboot 模式下：
```bash
fastboot getvar all
# 显示所有设备变量和状态
```

## 🎯 当前功能状态

### ✅ 完全支持

- **Fastboot 模式操作**:
  - 刷写分区 (flash)
  - 擦除分区 (erase)
  - 重启设备 (reboot)
  - Bootloader 解锁/锁定
  - 获取设备变量

### ⚠️ 部分支持

- **ADB 模式**:
  - 设备检测 ✅
  - 基本信息获取 ✅
  - Shell 命令执行 ❌ (需要认证)
  - 文件操作 ❌ (需要认证)
  - 应用管理 ❌ (需要认证)

### 🔄 开发中

- 完整 ADB 协议实现
- RSA 密钥认证
- 文件管理器
- 应用管理器
- 批量操作脚本

## 💡 最佳实践

### 推荐工作流程

1. **准备阶段**:
   ```
   ✅ 备份数据
   ✅ 下载正确的 ROM/镜像
   ✅ 充电至 > 50%
   ✅ 准备好线刷工具（以防万一）
   ```

2. **解锁 Bootloader** (首次):
   ```
   ✅ 启用开发者选项
   ✅ 开启 OEM 解锁
   ✅ 进入 Fastboot 模式
   ✅ 使用 AndroidPlus 或 fastboot 命令解锁
   ✅ 设备会清除所有数据并重启
   ```

3. **刷写镜像**:
   ```
   ✅ 重启到 Fastboot 模式
   ✅ 连接 AndroidPlus
   ✅ 选择分区和镜像文件
   ✅ 确认操作
   ✅ 等待完成
   ✅ 重启设备
   ```

4. **验证**:
   ```
   ✅ 设备正常启动
   ✅ 系统功能正常
   ✅ 可以锁定 Bootloader (可选)
   ```

### 安全提示

⚠️ **切勿**:
- 刷写来源不明的镜像
- 刷写错误型号的镜像
- 在电量低时刷机
- 刷机过程中断开连接
- 刷写 critical 分区（bootloader、modem）除非确定安全

✅ **务必**:
- 备份重要数据
- 使用可信的镜像源
- 阅读刷机说明
- 保留官方线刷包
- 了解救砖方法

## 📞 获取帮助

如果问题仍未解决：

1. **查看文档**:
   - [README.md](README.md) - 功能说明
   - [USAGE.md](USAGE.md) - 使用指南
   - [QUICKSTART.md](QUICKSTART.md) - 快速开始
   - [TECHNICAL.md](TECHNICAL.md) - 技术细节

2. **社区支持**:
   - GitHub Issues
   - XDA Developers
   - 设备专属论坛

3. **命令行替代**:
   - 使用 `adb` 命令行工具
   - 使用 `fastboot` 命令行工具
   - 使用设备厂商提供的工具

## 🚧 已知限制

当前版本的限制：

1. **ADB 认证**:
   - 需要 RSA 密钥交换
   - 浏览器环境难以实现密钥存储
   - 正在研究解决方案

2. **大文件传输**:
   - 受浏览器内存限制
   - 建议 < 2GB 的镜像文件

3. **批量操作**:
   - 脚本功能需要稳定的 ADB 连接
   - 目前建议使用 Fastboot 模式

## 🔮 未来改进

计划中的功能：

- [ ] 完整的 ADB 认证支持
- [ ] WebADB 密钥管理
- [ ] 改进的文件传输
- [ ] 更好的错误恢复
- [ ] 设备特定优化

---

**遇到其他问题？** 请在 GitHub 提交 Issue，我们会尽快帮助你！
