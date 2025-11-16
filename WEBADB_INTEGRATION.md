# 集成 WebADB 库指南

## 📦 安装依赖

AndroidPlus 现在支持使用完整的 WebADB 库来获得更好的 ADB 支持！

### 方法 1: 使用 Vite 开发服务器（推荐）

```bash
cd ~/Documents/GitHub/AndroidPlus
git pull

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

Vite 会自动打包所有依赖，包括：
- `@yume-chan/adb` - 完整的 ADB 协议实现
- `@yume-chan/adb-daemon-webusb` - WebUSB 传输层
- `@yume-chan/adb-credential-web` - 浏览器认证存储

### 方法 2: 使用 CDN（简单但功能有限）

如果不想安装 npm 依赖，可以直接使用 CDN：

在 `index.html` 中添加（已为你准备好）：

```html
<script type="importmap">
{
  "imports": {
    "@yume-chan/adb": "https://esm.sh/@yume-chan/adb@2.3.1",
    "@yume-chan/adb-daemon-webusb": "https://esm.sh/@yume-chan/adb-daemon-webusb@2.1.0",
    "@yume-chan/adb-credential-web": "https://esm.sh/@yume-chan/adb-credential-web@2.1.0"
  }
}
</script>
```

### 方法 3: 继续使用简化版本

如果只想快速测试，可以继续使用当前的简化 ADB 实现：

```bash
python3 -m http.server 8000
```

## 🎯 WebADB 功能

使用完整的 WebADB 库后，你将获得：

### ✅ 完全支持的功能

1. **ADB 认证**
   - RSA 密钥自动生成和存储
   - 设备授权管理
   - 支持持久化认证

2. **文件操作**
   - ✅ 上传文件到设备 (push)
   - ✅ 从设备下载文件 (pull)
   - ✅ 浏览文件系统
   - ✅ 创建/删除文件夹

3. **应用管理**
   - ✅ 安装 APK
   - ✅ 卸载应用
   - ✅ 列出已安装应用
   - ✅ 启动应用

4. **Shell 命令**
   - ✅ 完整的 shell 命令支持
   - ✅ 实时输出流
   - ✅ 命令管道支持

5. **高级功能**
   - ✅ 端口转发
   - ✅ 截图/录屏
   - ✅ 屏幕镜像 (配合 scrcpy)
   - ✅ logcat 实时日志

## 🚀 使用示例

### 启动应用（推荐方式）

```bash
# 1. 安装依赖并使用 Vite
cd ~/Documents/GitHub/AndroidPlus
git pull
npm install
npm run dev

# 浏览器会自动打开 http://localhost:5173
```

### 连接设备

1. 设备开启 USB 调试
2. 在 AndroidPlus 中点击 "Connect Device"
3. 选择设备
4. 设备上允许 USB 调试（首次）
5. WebADB 会自动生成并存储 RSA 密钥

### 使用新功能

所有功能都集成在 UI 中：

- **File Manager** - 真正的文件浏览和传输
- **App Manager** - APK 安装和应用管理
- **ADB Commands** - 完整的 shell 支持
- **Tools** - 截图、录屏等

## 📊 对比

| 功能 | 简化版本 | WebADB 完整版 |
|------|---------|--------------|
| Fastboot | ✅ 支持 | ✅ 支持 |
| ADB 认证 | ❌ 不支持 | ✅ 完整支持 |
| 文件传输 | ❌ 不支持 | ✅ 完整支持 |
| APK 安装 | ❌ 不支持 | ✅ 完整支持 |
| Shell 命令 | ⚠️ 部分支持 | ✅ 完整支持 |
| 需要 npm | ❌ 不需要 | ✅ 需要 |

## 🔧 故障排除

### 问题 1: npm install 失败

**解决方案**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm cache clean --force

# 重新安装
npm install
```

### 问题 2: Vite 构建错误

**解决方案**:
```bash
# 确保使用最新版本
npm install vite@latest --save-dev

# 或使用 Python HTTP Server
python3 -m http.server 8000
```

### 问题 3: WebADB 库加载失败

检查浏览器控制台，确保：
1. 使用 `npm run dev` 启动
2. 或正确配置了 CDN importmap
3. 浏览器支持 ES modules

## 💡 推荐配置

### 开发环境

```bash
git pull
npm install
npm run dev
```

### 生产环境

```bash
git pull
npm install
npm run build
npm run preview
```

### 快速测试（无依赖）

```bash
git pull
python3 -m http.server 8000
# 使用简化版本，Fastboot 完全可用
```

## 📚 更多资源

- [WebADB 官方文档](https://github.com/yume-chan/ya-webadb)
- [ADB 协议说明](https://github.com/yume-chan/ya-webadb/tree/main/libraries/adb)
- [在线演示](https://webadb.github.io/)

## 🎉 开始使用

```bash
cd ~/Documents/GitHub/AndroidPlus
git pull
npm install
npm run dev
```

然后在浏览器中享受完整的 ADB 功能！
