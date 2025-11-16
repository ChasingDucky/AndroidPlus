# 快速启动指南 / Quick Start Guide

## 🚀 最简单的方式运行（无需 npm）

AndroidPlus 是纯前端应用，可以直接在浏览器中运行！

### 方法 1: 直接打开（推荐用于快速测试）

```bash
# 在项目目录中
open index.html  # macOS
# 或者在文件管理器中双击 index.html
```

**注意**: 由于浏览器安全限制，某些功能（如模块导入）可能无法正常工作。建议使用方法 2 或 3。

### 方法 2: 使用 Python HTTP 服务器（推荐）

```bash
# 确保在 AndroidPlus 目录中
cd AndroidPlus

# Python 3
python3 -m http.server 8000

# 或者 Python 2
python -m SimpleHTTPServer 8000

# 然后在浏览器中打开：
# http://localhost:8000
```

### 方法 3: 使用 Node.js HTTP 服务器

```bash
# 如果你有 Node.js，可以安装一个简单的 HTTP 服务器
npm install -g http-server

# 然后运行
http-server -p 8000

# 在浏览器中打开：
# http://localhost:8000
```

## 📦 使用 Vite 开发服务器（可选）

如果你想使用热重载等开发功能：

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 自动打开浏览器访问 http://localhost:3000
```

## ⚠️ 常见问题

### 问题 1: npm install 失败

**原因**: package.json 中的依赖包不存在

**解决方案**: 我已经修复了这个问题。运行：

```bash
git pull origin claude/pixel-flashing-page-016AmF3eoWDztCABHKnfe3n9
npm install
```

或者直接使用 Python HTTP 服务器（方法 2）。

### 问题 2: WebUSB 不工作

**原因**: WebUSB 需要 HTTPS 或 localhost

**解决方案**:
- 使用 `localhost` 而不是 `127.0.0.1`
- 确保使用 Chrome、Edge 或 Opera 浏览器
- Firefox 和 Safari 不支持 WebUSB

### 问题 3: 模块加载失败

**原因**: 直接打开 HTML 文件时，浏览器不允许加载本地模块

**解决方案**: 使用 HTTP 服务器（方法 2 或 3）

## 🔧 推荐的开发环境

### 最佳实践

```bash
# 1. 拉取最新代码
git pull

# 2. 使用 Python HTTP 服务器（最简单）
python3 -m http.server 8000

# 3. 在 Chrome/Edge 中打开
# http://localhost:8000

# 4. 连接你的 Android 设备并开始使用！
```

### 浏览器要求

✅ **支持的浏览器**:
- Chrome 61+
- Edge 79+
- Opera 48+

❌ **不支持的浏览器**:
- Firefox（无 WebUSB 支持）
- Safari（无 WebUSB 支持）

## 📱 设备准备

### Android 设备设置

1. **启用开发者选项**
   - 进入 设置 > 关于手机
   - 连续点击"版本号" 7 次

2. **启用 USB 调试**
   - 进入 设置 > 开发者选项
   - 开启 "USB 调试"
   - 开启 "OEM 解锁"（如果要解锁 bootloader）

3. **连接设备**
   - 使用 USB 数据线连接电脑
   - 在设备上允许 USB 调试授权

## 🎯 第一次使用

1. 在浏览器中打开应用
2. 点击 "Connect Device"
3. 在弹出窗口中选择你的设备
4. 在设备上确认 USB 调试授权
5. 等待设备信息加载完成
6. 开始使用各种功能！

## 💡 快速功能导览

### 标签页说明

- **Fastboot**: 刷写分区、解锁 bootloader、重启设备
- **ADB Commands**: 执行 ADB shell 命令
- **File Manager**: 浏览和管理设备文件
- **App Manager**: 管理已安装的应用
- **Batch Operations**: 自动化脚本和批量操作
- **Device Presets**: 使用预设配置快速刷机
- **Tools**: 截图、录屏、系统信息

## 🐛 遇到问题？

1. **查看控制台**: 按 F12 打开浏览器开发者工具，查看 Console 标签
2. **查看日志**: 应用底部的 Console Output 显示所有操作日志
3. **重新连接**: 断开并重新连接设备
4. **重启浏览器**: 有时候需要完全重启浏览器

## 📚 更多文档

- **[README.md](README.md)** - 项目概述
- **[USAGE.md](USAGE.md)** - 详细使用指南
- **[TECHNICAL.md](TECHNICAL.md)** - 技术文档
- **[CHANGELOG.md](CHANGELOG.md)** - 版本历史

## 🎉 享受使用 AndroidPlus！

有问题或建议？欢迎提交 Issue 或 Pull Request！
