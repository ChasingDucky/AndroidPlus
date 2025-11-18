# AndroidPlus 用户使用指南

> 完整的用户使用 Wiki - 从入门到精通

欢迎使用 AndroidPlus！本指南将帮助你充分利用 AndroidPlus 的所有功能。

## 📖 目录

1. [快速开始](#快速开始)
2. [系统要求](#系统要求)
3. [安装与运行](#安装与运行)
4. [设备连接](#设备连接)
5. [核心功能](#核心功能)
   - [Fastboot 刷机](#fastboot-刷机)
   - [ADB 操作](#adb-操作)
   - [文件管理](#文件管理)
   - [应用管理](#应用管理)
   - [批处理脚本](#批处理脚本)
6. [进阶操作](#进阶操作)
7. [常见问题](#常见问题)
8. [故障排除](#故障排除)
9. [安全提示](#安全提示)
10. [最佳实践](#最佳实践)

---

## 快速开始

### 5 分钟上手

1. **准备设备**
   - 在 Android 设备上启用 USB 调试
   - 连接设备到电脑 USB 口

2. **启动 AndroidPlus**
   ```bash
   npm install
   npm run dev
   ```

3. **打开浏览器**
   - 访问 http://localhost:3000

4. **连接设备**
   - 点击 "Connect Device" 按钮
   - 在弹出窗口选择你的设备
   - 在手机上点击"允许 USB 调试"

5. **开始使用**
   - 现在你可以执行 ADB 命令、管理文件和应用了！

---

## 系统要求

### 硬件要求
- 💻 **电脑**: 支持 USB 的台式机或笔记本电脑
- 📱 **Android 设备**: Android 5.0+ (推荐 Android 9.0+)
- 🔌 **USB 线缆**: 数据传输线缆（非仅充电线）

### 软件要求
- 🌐 **浏览器**:
  - ✅ Google Chrome 61+
  - ✅ Microsoft Edge 79+
  - ✅ Opera 48+
  - ❌ Firefox (不支持 WebUSB)
  - ❌ Safari (不支持 WebUSB)

- 📦 **Node.js**: v14+ (仅用于开发模式)
- 🐍 **Python**: 3.x (可选，用于简单 HTTP 服务器)

### Android 设备要求
- ✅ 已启用 USB 调试
- ✅ 已安装 USB 驱动（Windows）
- ✅ 解锁 Bootloader（仅用于 Fastboot 刷机）

---

## 安装与运行

### 方法 1: 完整功能模式（推荐）

此模式支持所有功能，包括完整的 ADB 认证、文件传输、APK 安装等。

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/AndroidPlus.git
cd AndroidPlus

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 访问 http://localhost:3000
```

**优点:**
- ✅ 完整的 WebADB 认证支持
- ✅ 所有 ADB 功能可用
- ✅ 文件上传/下载
- ✅ APK 安装
- ✅ 完整的设备信息获取

### 方法 2: 简单模式

适合快速测试，Fastboot 功能完全可用。

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/AndroidPlus.git
cd AndroidPlus

# 2. 启动 Python HTTP 服务器
python3 -m http.server 8000

# 3. 打开浏览器
# 访问 http://localhost:8000
```

**限制:**
- ⚠️ ADB 功能受限（无认证支持）
- ⚠️ 无法执行 shell 命令
- ⚠️ 无法传输文件
- ✅ Fastboot 功能完全可用

### 方法 3: 生产构建

用于部署到服务器。

```bash
# 1. 构建项目
npm run build

# 2. 预览构建结果
npm run preview

# 3. 或部署 dist/ 目录到你的 Web 服务器
```

---

## 设备连接

### 准备 Android 设备

#### 启用 USB 调试

1. **打开开发者选项**
   - 进入 `设置` → `关于手机`
   - 连续点击 `版本号` 7 次
   - 看到提示"您现在处于开发者模式"

2. **启用 USB 调试**
   - 返回 `设置` → `系统` → `开发者选项`
   - 打开 `USB 调试` 开关
   - 确认警告对话框

3. **（可选）启用 USB 调试安全设置**
   - 打开 `USB 调试（安全设置）`（部分设备需要）

#### 连接设备

1. **连接 USB 线缆**
   - 将设备连接到电脑
   - 确保使用数据线（非仅充电线）

2. **选择 USB 模式**
   - 在手机通知栏选择 `文件传输 (MTP)` 或 `PTP`
   - 部分设备可能需要选择 `传输文件`

3. **在 AndroidPlus 中连接**
   - 点击 `Connect Device` 按钮
   - 在浏览器弹出窗口选择你的设备
   - **重要**: 在手机上点击 `允许 USB 调试`
   - ✅ 勾选 `总是允许从这台计算机`

### 设备模式

AndroidPlus 支持两种设备模式:

#### 🔵 ADB 模式
- 设备正常启动状态
- 可执行 shell 命令
- 可管理文件和应用
- 可截图、录屏
- 需要 USB 调试授权

**如何进入:** 正常启动设备并启用 USB 调试即可

#### 🟠 Fastboot 模式
- 设备在 Bootloader 状态
- 可刷写系统镜像
- 可解锁/锁定 Bootloader
- 可擦除分区
- 不需要额外授权

**如何进入:**
1. 关闭设备
2. 同时按住 `电源键` + `音量减键`
3. 保持按压直到看到 Fastboot 界面
4. （或使用 ADB 命令: `adb reboot bootloader`）

**退出 Fastboot:**
- 按住电源键 10 秒，设备会重启

---

## 核心功能

### Fastboot 刷机

Fastboot 模式用于刷写系统镜像、解锁 Bootloader 等底层操作。

#### 刷写分区镜像

**步骤:**

1. **准备镜像文件**
   - 下载对应设备的官方镜像或第三方 ROM
   - 解压获得 `.img` 文件

2. **进入 Fastboot 模式**
   - 关机后同时按住 `电源键` + `音量减键`
   - 或在 ADB 模式下点击 `Reboot to Bootloader`

3. **连接设备**
   - 点击 `Connect Device`
   - 确认显示 "Connected (fastboot mode)"

4. **选择镜像和分区**
   - 点击 `Choose Image File` 选择镜像文件
   - 在 `Partition` 下拉菜单选择目标分区
     - `boot` - 启动镜像（包含内核和 ramdisk）
     - `recovery` - 恢复镜像
     - `system` - 系统镜像
     - `vendor` - 供应商镜像
     - `userdata` - 用户数据

5. **开始刷写**
   - 点击 `Flash Image` 按钮
   - 确认警告对话框
   - 等待进度条完成

6. **重启设备**
   - 刷写完成后点击 `Reboot System`

**常用分区说明:**

| 分区名称 | 用途 | 风险等级 |
|---------|------|---------|
| `boot` | 启动镜像，包含内核 | 🟡 中等 |
| `recovery` | 恢复模式镜像 | 🟢 低 |
| `system` | 系统分区 | 🟡 中等 |
| `vendor` | 供应商分区 | 🟡 中等 |
| `userdata` | 用户数据 | 🔴 高（会清空数据） |
| `cache` | 缓存分区 | 🟢 低 |

#### 解锁 Bootloader

**警告:** 解锁 Bootloader 会**清空所有数据**并可能**使保修失效**！

**步骤:**

1. **备份数据**
   - ⚠️ 务必备份所有重要数据！

2. **启用 OEM 解锁**
   - 进入 `设置` → `开发者选项`
   - 打开 `OEM 解锁` 开关

3. **进入 Fastboot 模式**

4. **连接设备**
   - 在 AndroidPlus 中连接设备

5. **解锁**
   - 点击 `Unlock Bootloader` 按钮
   - 确认警告对话框
   - 在设备上使用音量键选择 `Unlock`，电源键确认

6. **等待重启**
   - 设备会自动重启并清空数据
   - 首次启动时间较长

**小米设备特殊要求:**
- 必须使用小米官方解锁工具
- 需要等待 168 小时（7 天）
- 需要绑定小米账号

#### 锁定 Bootloader

**警告:** 锁定 Bootloader 也会**清空所有数据**！

**步骤:**
1. 确保设备刷写了**官方固件**（非第三方 ROM）
2. 进入 Fastboot 模式
3. 连接设备
4. 点击 `Lock Bootloader`
5. 确认并等待完成

**注意:** 如果锁定时设备未刷写官方固件，可能导致**砖机**！

#### 擦除分区

**步骤:**
1. 进入 Fastboot 模式
2. 连接设备
3. 点击 `Erase Partition` 按钮
4. 输入分区名称（如 `cache`, `userdata`）
5. 确认警告对话框

**安全分区:**
- `cache` - 安全，可随时擦除
- `userdata` - 安全，会清空数据

**危险分区:**
- `boot`, `system`, `vendor` - 擦除后设备无法启动
- 仅在刷机前擦除

---

### ADB 操作

ADB (Android Debug Bridge) 模式用于设备正常运行时的操作。

#### 执行 Shell 命令

**步骤:**

1. **连接设备（ADB 模式）**
   - 设备正常启动
   - 启用 USB 调试
   - 在 AndroidPlus 中连接
   - ✅ 确认显示 "WebADB authenticated successfully"

2. **进入 ADB 命令标签页**
   - 点击 `ADB Commands` 标签

3. **输入命令**
   - 在命令输入框输入 shell 命令
   - 例如: `ls /sdcard`

4. **执行**
   - 点击 `Execute` 或按 Enter
   - 查看输出结果

**常用命令:**

```bash
# 查看设备属性
getprop ro.product.model
getprop ro.build.version.release

# 列出文件
ls /sdcard
ls -la /data/local/tmp

# 查看进程
ps
ps | grep com.android.chrome

# 包管理
pm list packages
pm list packages -3  # 仅用户应用
pm list packages -s  # 仅系统应用

# 活动管理
am start -n com.android.settings/.Settings
am force-stop com.example.app

# 截图（保存到设备）
screencap -p /sdcard/screenshot.png

# 录屏
screenrecord /sdcard/recording.mp4

# 系统信息
dumpsys battery      # 电池信息
dumpsys meminfo      # 内存信息
cat /proc/cpuinfo    # CPU 信息
```

#### 快捷操作

AndroidPlus 提供了常用操作的快捷按钮:

**📸 截图**
1. 点击 `Take Screenshot` 按钮
2. 截图保存到 `/sdcard/AndroidPlus_screenshot.png`
3. 使用文件管理器下载截图

**🎥 录屏**
1. 点击 `Start Recording` 按钮
2. 执行需要录制的操作
3. 点击 `Stop Recording` 按钮
4. 录像保存到 `/sdcard/AndroidPlus_recording.mp4`

**🔋 电池信息**
- 点击 `Battery Info` 查看电池状态、电量、温度等

**💾 内存信息**
- 点击 `Memory Info` 查看总内存、可用内存等

**🖥️ CPU 信息**
- 点击 `CPU Info` 查看 CPU 型号、架构、核心数等

---

### 文件管理

使用文件管理器可以浏览、上传、下载、管理设备上的文件。

#### 浏览文件

1. **打开文件管理器**
   - 点击 `File Manager` 标签
   - 默认显示 `/sdcard` 目录

2. **导航**
   - 点击文件夹名称进入
   - 点击面包屑导航快速跳转
   - 点击 `⬆️ Parent Directory` 返回上级

3. **查看文件信息**
   - 文件名旁显示图标（📄文件 📁文件夹）
   - 显示文件大小、权限、修改时间

#### 上传文件

1. **选择目标目录**
   - 导航到要上传的目录

2. **上传**
   - 点击 `Upload File` 按钮
   - 选择本地文件
   - 等待上传完成

**示例用途:**
- 上传 APK 文件到 `/sdcard` 进行安装
- 上传媒体文件到设备
- 上传配置文件

#### 下载文件

1. **找到文件**
   - 浏览到文件所在目录

2. **下载**
   - 点击文件旁的 `Download` 按钮
   - 文件会保存到浏览器默认下载位置

**示例用途:**
- 下载截图和录屏
- 下载应用数据备份
- 下载日志文件

#### 文件操作

**重命名文件/文件夹**
1. 点击文件旁的 `✏️ Rename` 按钮
2. 输入新名称
3. 确认

**删除文件/文件夹**
1. 点击文件旁的 `🗑️ Delete` 按钮
2. 确认删除
3. ⚠️ 删除操作不可恢复！

**创建文件夹**
1. 点击 `Create Folder` 按钮
2. 输入文件夹名称
3. 确认

#### 常用目录

| 目录路径 | 用途 | 权限 |
|---------|------|------|
| `/sdcard` | 内部存储（用户可访问） | 读写 |
| `/sdcard/Download` | 下载目录 | 读写 |
| `/sdcard/DCIM` | 相机照片 | 读写 |
| `/sdcard/Pictures` | 图片 | 读写 |
| `/sdcard/Android/data` | 应用数据 | 读写 |
| `/data/app` | 已安装应用 APK | 只读 |
| `/data/data` | 应用私有数据 | 需要 root |
| `/system` | 系统分区 | 只读（需 root 写入） |

---

### 应用管理

应用管理器提供强大的应用管理功能。

#### 查看已安装应用

1. **打开应用管理器**
   - 点击 `App Manager` 标签

2. **刷新列表**
   - 点击 `Refresh Apps` 按钮
   - 等待应用列表加载

3. **过滤应用**
   - `All Apps` - 所有应用
   - `User Apps` - 仅用户安装的应用
   - `System Apps` - 仅系统应用

4. **搜索应用**
   - 在搜索框输入应用名称或包名

#### 查看应用详情

1. 点击应用名称
2. 查看详细信息:
   - 包名 (Package Name)
   - 版本号 (Version)
   - 安装路径 (Install Path)
   - 数据目录 (Data Directory)
   - 应用大小 (Size)
   - 是否系统应用

#### 卸载应用

**单个卸载:**
1. 找到要卸载的应用
2. 点击 `Uninstall` 按钮
3. 确认卸载

**批量卸载:**
1. 勾选要卸载的多个应用
2. 点击 `Batch Uninstall` 按钮
3. 确认批量卸载
4. 查看卸载结果（成功/失败列表）

**注意:**
- 系统应用可能无法卸载（需要 root）
- 部分预装应用可以禁用但不能卸载

#### 其他应用操作

**启用/禁用应用**
- 点击 `Enable` 或 `Disable` 按钮
- 禁用的应用不会运行但仍占用存储空间

**清除应用数据**
- 点击 `Clear Data` 按钮
- ⚠️ 会删除应用所有数据、设置和缓存

**强制停止**
- 点击 `Force Stop` 按钮
- 立即停止应用运行

**启动应用**
- 点击 `Launch` 按钮
- 打开应用主界面

#### 安装 APK

1. **上传 APK**
   - 使用文件管理器上传 APK 到 `/sdcard`
   - 或使用 `Install APK` 按钮直接安装

2. **安装**
   - 选择 APK 文件
   - 等待安装完成

**安装选项:**
- `-r` - 覆盖安装（保留数据）
- `-d` - 允许降级安装
- `-t` - 允许测试包

---

### 批处理脚本

批处理脚本功能可以自动化执行一系列操作。

#### 使用预设模板

AndroidPlus 提供了常用场景的预设模板:

**📱 完整 ROM 刷写**
1. 点击 `Batch Operations` 标签
2. 选择 `Flash ROM` 模板
3. 上传所需镜像:
   - boot.img
   - system.img
   - vendor.img
   - （可选）其他分区镜像
4. 点击 `Execute Script` 运行

**🧹 设备精简（Debloat）**
1. 选择 `Debloat Device` 模板
2. 查看要卸载的 bloatware 列表
3. 根据需要添加/删除包名
4. 执行脚本批量卸载

**⚡ 性能优化**
1. 选择 `Performance Optimization` 模板
2. 脚本会:
   - 禁用动画
   - 清理缓存
   - 优化内存
   - 调整后台限制
3. 执行脚本

**💾 备份工作流**
1. 选择 `Backup Workflow` 模板
2. 指定备份目录
3. 脚本会备份:
   - 应用列表
   - 设置
   - 数据文件
4. 执行脚本

#### 创建自定义脚本

1. **新建脚本**
   - 点击 `Create New Script` 按钮
   - 输入脚本名称和描述

2. **添加步骤**

   **刷写步骤:**
   - 点击 `Add Flash Step`
   - 选择分区和镜像文件

   **ADB 命令步骤:**
   - 点击 `Add ADB Step`
   - 输入 shell 命令

   **重启步骤:**
   - 点击 `Add Reboot Step`
   - 选择重启目标（System/Bootloader/Recovery）

   **延时步骤:**
   - 点击 `Add Delay Step`
   - 设置等待时间（秒）

3. **调整步骤顺序**
   - 拖动步骤调整执行顺序
   - 点击 `🗑️` 删除步骤

4. **保存脚本**
   - 点击 `Save Script` 保存到本地存储
   - 下次可以加载使用

5. **执行脚本**
   - 点击 `Execute Script` 运行
   - 查看进度和日志
   - 等待完成

#### 脚本示例

**示例 1: 刷写 TWRP 并重启到 Recovery**
```
步骤 1: Flash partition=recovery, file=twrp.img
步骤 2: Reboot target=recovery
```

**示例 2: 卸载 Facebook 全家桶**
```
步骤 1: ADB command: pm uninstall com.facebook.katana
步骤 2: ADB command: pm uninstall com.facebook.system
步骤 3: ADB command: pm uninstall com.facebook.appmanager
步骤 4: ADB command: pm uninstall com.facebook.services
```

**示例 3: 完整刷机流程**
```
步骤 1: Flash partition=boot, file=boot.img
步骤 2: Delay 3 seconds
步骤 3: Flash partition=system, file=system.img
步骤 4: Delay 3 seconds
步骤 5: Flash partition=vendor, file=vendor.img
步骤 6: Delay 3 seconds
步骤 7: Reboot target=system
```

---

## 进阶操作

### 设备预设配置

不同品牌的设备有不同的分区布局和特殊要求，AndroidPlus 提供了预设配置。

#### 使用设备预设

1. **选择设备品牌**
   - Google Pixel
   - Samsung Galaxy
   - Xiaomi
   - OnePlus
   - Motorola
   - Generic (通用)

2. **加载预设**
   - 点击 `Load Preset` 按钮
   - 预设会自动配置:
     - 常用分区列表
     - 推荐命令
     - Bloatware 列表
     - 优化设置

3. **应用预设**
   - 预设配置会应用到刷机和脚本功能

#### 创建自定义预设

1. 点击 `Create Custom Preset`
2. 配置:
   - 设备名称
   - 制造商
   - 分区列表
   - 默认命令
   - Bloatware 包名
3. 保存预设

### 高级 Shell 命令

#### 设备信息采集

```bash
# 完整设备信息
getprop

# 特定属性
getprop ro.product.model           # 设备型号
getprop ro.product.manufacturer    # 制造商
getprop ro.build.version.release   # Android 版本
getprop ro.build.version.sdk       # SDK 版本
getprop ro.build.id                # Build ID
getprop ro.product.cpu.abi         # CPU 架构

# 硬件信息
cat /proc/cpuinfo                  # CPU 详情
cat /proc/meminfo                  # 内存详情
df -h                              # 存储空间
dumpsys battery                    # 电池状态
```

#### 应用管理

```bash
# 列出所有包
pm list packages

# 过滤包
pm list packages | grep facebook   # 包含 facebook 的包
pm list packages -3                # 仅用户应用
pm list packages -s                # 仅系统应用
pm list packages -e                # 仅启用的应用
pm list packages -d                # 仅禁用的应用

# 应用信息
pm dump com.android.chrome         # 包详细信息
pm path com.android.chrome         # APK 路径

# 应用操作
pm install /sdcard/app.apk         # 安装
pm uninstall com.example.app       # 卸载
pm clear com.example.app           # 清除数据
pm disable com.example.app         # 禁用
pm enable com.example.app          # 启用

# 权限管理
pm grant com.example.app android.permission.CAMERA
pm revoke com.example.app android.permission.CAMERA
```

#### 活动管理

```bash
# 启动应用
am start -n com.android.settings/.Settings

# 启动特定活动
am start -a android.intent.action.VIEW -d https://www.google.com

# 广播
am broadcast -a android.intent.action.BOOT_COMPLETED

# 强制停止
am force-stop com.example.app

# 杀死进程
am kill com.example.app
```

#### 文件操作

```bash
# 列出文件
ls -la /sdcard
ls -lh /data/app    # 人类可读的大小

# 复制文件
cp /sdcard/source.txt /sdcard/dest.txt

# 移动文件
mv /sdcard/old.txt /sdcard/new.txt

# 删除文件
rm /sdcard/file.txt
rm -rf /sdcard/folder  # 递归删除目录

# 创建目录
mkdir /sdcard/newfolder

# 查看文件内容
cat /sdcard/text.txt
head -20 /sdcard/log.txt   # 前 20 行
tail -20 /sdcard/log.txt   # 后 20 行

# 查找文件
find /sdcard -name "*.jpg"
```

#### 网络操作

```bash
# 查看网络连接
netstat

# Ping
ping -c 4 8.8.8.8

# 查看 IP 地址
ip addr show

# WiFi 信息
dumpsys wifi
```

#### 性能分析

```bash
# 查看进程
ps
ps | grep com.android.chrome

# Top 进程
top -n 1   # 运行一次
top -m 10  # 显示前 10 个

# 内存使用
dumpsys meminfo
dumpsys meminfo com.android.chrome

# CPU 使用
dumpsys cpuinfo

# 电池统计
dumpsys batterystats
```

### 日志分析

#### 查看日志

```bash
# 实时日志
logcat

# 清除日志
logcat -c

# 过滤日志
logcat *:E          # 仅错误
logcat *:W          # 警告及以上
logcat | grep "TAG"  # 包含特定标签

# 保存日志
logcat -d > /sdcard/logcat.txt
```

在 AndroidPlus 中:
1. 所有操作都会记录到控制台
2. 点击 `Download Log` 下载完整日志
3. 日志包含时间戳和操作类型

---

## 常见问题

### 连接问题

**Q: 点击 "Connect Device" 后没有看到我的设备？**

A: 请检查:
1. ✅ USB 线缆是否连接正常（尝试重新插拔）
2. ✅ 设备是否已启用 USB 调试
3. ✅ 是否使用了支持数据传输的线缆（非仅充电线）
4. ✅ Windows 用户：是否安装了 USB 驱动
5. ✅ 尝试更换 USB 端口

**Q: 提示 "Authentication required"？**

A: 这说明:
1. 你在 ADB 模式下连接
2. 需要使用完整功能模式（npm run dev）
3. 在手机上点击"允许 USB 调试"

解决方法:
```bash
npm install
npm run dev
# 然后重新连接设备
```

**Q: 连接后立即断开？**

A: 可能原因:
1. USB 线缆质量差或损坏
2. USB 端口供电不足
3. 设备 USB 调试权限被撤销

解决:
1. 更换高质量 USB 线缆
2. 使用电脑主板上的 USB 端口（非前置面板）
3. 在设备上重新授权 USB 调试

### 刷机问题

**Q: 刷写 boot 镜像后设备无法启动？**

A: 可能原因:
1. 镜像文件损坏
2. 镜像与设备不匹配
3. 未解锁 Bootloader

解决:
1. 重新下载官方镜像
2. 确认镜像适配你的设备型号
3. 重新刷写原厂 boot.img
4. 如果无法启动，进入 Recovery 模式恢复

**Q: 提示 "FAILED (remote: Partition doesn't exist)"？**

A: 这说明:
- 你输入的分区名称不存在
- 检查你的设备分区布局
- 使用正确的分区名称（如 `boot` 而非 `boot_a`）

**Q: 刷写过程中卡住？**

A: 尝试:
1. 等待 5 分钟（大镜像需要时间）
2. 检查 USB 连接
3. 刷新页面重试
4. 使用传统 Fastboot 工具恢复

### ADB 问题

**Q: ADB 命令无响应？**

A: 检查:
1. 是否使用了 npm run dev 模式
2. 是否通过了 ADB 认证
3. 设备是否在 ADB 模式（非 Fastboot）

**Q: 无法执行某些命令？**

A: 某些命令需要:
- Root 权限（如访问 /data/data）
- 特定权限
- SELinux 配置

### 文件传输问题

**Q: 文件上传失败？**

A: 可能原因:
1. 目标目录没有写权限
2. 存储空间不足
3. 文件名包含非法字符

解决:
1. 上传到 /sdcard 目录
2. 检查设备存储空间
3. 使用简单的文件名（避免特殊字符）

**Q: 文件下载很慢？**

A: 这是正常的:
- WebUSB 传输速度较慢（约 1-5 MB/s）
- 大文件传输需要耐心等待
- 使用传统 ADB 可能更快

### 应用管理问题

**Q: 无法卸载系统应用？**

A: 系统应用通常需要:
- Root 权限
- 系统分区可写

替代方案:
- 使用 `Disable` 禁用应用（效果类似）
- 使用 `pm uninstall --user 0 <package>` 卸载当前用户的应用

**Q: 应用列表加载慢？**

A: 这是正常的:
- 需要查询所有已安装应用
- 应用数量越多越慢
- 首次加载后会缓存

---

## 故障排除

### 设备变砖（无法启动）

#### 症状
- 设备卡在启动画面
- 无限重启循环
- 黑屏无反应

#### 恢复步骤

**方法 1: 刷回原厂镜像**
1. 进入 Fastboot 模式（电源+音量减）
2. 下载设备官方固件
3. 使用 AndroidPlus 刷写:
   - boot.img
   - system.img
   - vendor.img
4. 重启

**方法 2: 使用 Recovery 模式**
1. 进入 Recovery 模式（电源+音量加）
2. 选择 "Wipe data/factory reset"
3. 选择 "Reboot system now"

**方法 3: 使用官方刷机工具**
- 小米: Mi Flash Tool
- 三星: Odin
- Google: Android Flash Tool
- 其他品牌: 查阅官方文档

### Bootloop（启动循环）

#### 原因
- 刷写了不兼容的 ROM
- 系统文件损坏
- 内核不匹配

#### 解决
1. 进入 Recovery 模式
2. Wipe cache partition
3. 如果仍不行，Wipe data/factory reset
4. 重新刷写原厂固件

### Fastboot 命令失败

#### 症状
- "FAILED (remote: unknown command)"
- "FAILED (remote: not allowed)"

#### 解决
1. 检查 Bootloader 是否解锁
2. 确认命令语法正确
3. 部分命令需要特定 Bootloader 版本

### WebUSB 权限被拒绝

#### 症状
- "Access denied"
- "Permission denied"

#### 解决（Linux）
```bash
# 创建 udev 规则
sudo nano /etc/udev/rules.d/51-android.rules

# 添加内容:
SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"

# 重新加载规则
sudo udevadm control --reload-rules
sudo udevadm trigger
```

#### 解决（Windows）
1. 安装设备 USB 驱动
2. 运行 Chrome 为管理员（不推荐）
3. 检查 Windows 设备管理器

### 浏览器兼容性

| 问题 | 原因 | 解决 |
|-----|------|------|
| "WebUSB not supported" | 浏览器不支持 WebUSB | 使用 Chrome/Edge |
| "Secure context required" | 非 HTTPS 或 localhost | 使用 localhost 或 HTTPS |
| 设备列表为空 | WebUSB 权限问题 | 检查浏览器权限设置 |

---

## 安全提示

### ⚠️ 重要警告

1. **数据丢失风险**
   - 刷机、解锁 Bootloader 会清空所有数据
   - 务必提前备份重要数据

2. **变砖风险**
   - 刷写错误的镜像可能导致设备无法启动
   - 仅刷写官方或可信来源的镜像
   - 确保镜像与设备型号匹配

3. **保修失效**
   - 解锁 Bootloader 通常会使保修失效
   - 部分设备可以重新锁定恢复保修

4. **安全风险**
   - 解锁 Bootloader 降低设备安全性
   - 可能被恶意软件利用
   - 谨慎安装第三方 ROM

### 🔒 最佳安全实践

1. **验证文件完整性**
   - 下载后验证 MD5/SHA256
   - 从官方渠道下载镜像

2. **备份策略**
   - 刷机前完整备份
   - 备份重要分区（boot、recovery）
   - 保存备份到电脑

3. **测试环境**
   - 在测试设备上先试验
   - 不要在主力设备上冒险

4. **保留恢复选项**
   - 保存原厂镜像
   - 保留工作的 Recovery
   - 了解强制进入 Fastboot 的方法

### 🚫 禁止操作

- ❌ 不要刷写其他设备的镜像
- ❌ 不要擦除 unknown 分区
- ❌ 不要在电量低于 50% 时刷机
- ❌ 不要在刷机过程中拔掉 USB
- ❌ 不要锁定 Bootloader 如果刷了非官方 ROM

---

## 最佳实践

### 刷机前准备清单

- [ ] 设备电量 > 70%
- [ ] 下载官方固件包
- [ ] 验证固件 MD5/SHA256
- [ ] 完整备份数据
- [ ] 备份照片到云端
- [ ] 记录已安装应用列表
- [ ] 确认设备型号匹配
- [ ] 准备好官方线刷工具（备用）
- [ ] 了解设备进入 Fastboot 的方法
- [ ] 准备恢复用的原厂镜像

### 刷机流程

1. **准备阶段**
   ```
   ✓ 备份数据
   ✓ 充电到 70%+
   ✓ 下载并验证镜像
   ```

2. **解锁阶段**
   ```
   ✓ 启用 OEM 解锁
   ✓ 进入 Fastboot
   ✓ 解锁 Bootloader
   ✓ 重启验证
   ```

3. **刷写阶段**
   ```
   ✓ 进入 Fastboot
   ✓ 按顺序刷写各分区:
     1. boot.img
     2. system.img
     3. vendor.img
     4. 其他分区
   ✓ 验证每个步骤成功
   ```

4. **清理阶段**
   ```
   ✓ 擦除 cache
   ✓ 擦除 userdata（可选）
   ✓ 重启到系统
   ```

5. **验证阶段**
   ```
   ✓ 检查系统启动
   ✓ 验证功能正常
   ✓ 恢复数据
   ```

### Debloat 最佳实践

1. **创建备份**
   - 备份应用列表: `pm list packages > packages.txt`

2. **分类卸载**
   - 第一批: 明确无用的应用（Facebook, Bloatware）
   - 第二批: 可能有用的应用
   - 保留: 系统核心应用

3. **建议保留的系统应用**
   ```
   com.android.systemui          # 系统界面
   com.android.settings          # 设置
   com.android.phone            # 电话
   com.android.contacts         # 联系人
   com.google.android.gms       # Google Play 服务
   ```

4. **可安全卸载的常见 Bloatware**
   ```
   com.facebook.*               # Facebook 全家桶
   com.netflix.*                # Netflix
   com.spotify.*                # Spotify
   各品牌的自带应用              # 如小米音乐、小米视频等
   ```

### 性能优化技巧

1. **禁用动画**
   ```bash
   settings put global window_animation_scale 0
   settings put global transition_animation_scale 0
   settings put global animator_duration_scale 0
   ```

2. **后台限制**
   ```bash
   settings put global background_process_limit 3
   ```

3. **清理缓存**
   ```bash
   pm trim-caches 2048M
   ```

4. **禁用不需要的服务**
   - 使用应用管理器禁用不用的应用
   - 减少后台运行

---

## 品牌特定注意事项

### 小米/Redmi

**解锁 Bootloader:**
- 必须使用官方解锁工具
- 等待时间: 168 小时（7 天）
- 需要绑定小米账号

**特殊分区:**
- `cust` - 定制分区
- `persist` - 持久化数据（不要擦除）

### 三星

**警告:**
- 解锁 Bootloader 会触发 Knox 保险丝
- Knox 一旦触发永久失效
- 某些功能（Samsung Pay）将不可用

**刷机工具:**
- 推荐使用 Odin（官方工具）
- Fastboot 支持有限

### Google Pixel

**优势:**
- 官方支持解锁
- 刷机友好
- 完整的 Fastboot 支持

**注意:**
- 使用 A/B 分区系统
- 刷写时需指定槽位（_a 或 _b）

### OnePlus

**优势:**
- 解锁简单
- 社区支持好

**注意:**
- 部分型号需要深度测试（Deep Testing）

---

## 术语表

| 术语 | 说明 |
|-----|------|
| ADB | Android Debug Bridge，安卓调试桥 |
| Fastboot | Android bootloader 模式 |
| Bootloader | 引导加载程序 |
| Recovery | 恢复模式 |
| ROM | 只读存储器，这里指系统固件 |
| Root | 获取超级用户权限 |
| Brick | 变砖，设备无法启动 |
| Bootloop | 启动循环，无限重启 |
| OEM Unlock | OEM 解锁开关 |
| Partition | 分区 |
| Flash | 刷写，写入镜像到分区 |
| Wipe | 擦除，清空数据 |
| Stock ROM | 官方固件 |
| Custom ROM | 第三方定制固件 |

---

## 资源链接

### 官方资源
- **Android 开发者文档**: https://developer.android.com/studio/command-line/adb
- **Fastboot 文档**: https://source.android.com/devices/bootloader/fastboot

### 社区资源
- **XDA Developers**: https://forum.xda-developers.com/
- **Reddit /r/Android**: https://reddit.com/r/Android
- **LineageOS**: https://lineageos.org/

### 工具下载
- **Android SDK Platform Tools**: https://developer.android.com/studio/releases/platform-tools
- **Universal ADB Drivers (Windows)**: https://adb.clockworkmod.com/

### 固件下载
- **Google Pixel**: https://developers.google.com/android/images
- **Samsung**: https://www.sammobile.com/firmwares/
- **小米**: http://www.miui.com/download.html

---

## 获取帮助

### 遇到问题？

1. **查看故障排除部分**
   - 本 Wiki 包含常见问题解决方案

2. **查看控制台日志**
   - 点击 `Download Log` 下载日志
   - 日志包含详细错误信息

3. **搜索社区**
   - XDA Developers
   - Reddit
   - Stack Overflow

4. **提交 Issue**
   - GitHub Issues: https://github.com/your-repo/AndroidPlus/issues
   - 包含:
     - 设备型号
     - 操作系统
     - 浏览器版本
     - 详细步骤
     - 日志文件

### 贡献

欢迎贡献代码和文档！

---

**祝你刷机愉快！**

*最后更新: 2025-01-15*
