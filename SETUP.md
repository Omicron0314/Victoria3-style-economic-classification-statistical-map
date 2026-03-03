# 🚀 完整安装和运行指南

## 第一步：安装 Node.js

### macOS 用户

#### 方法 1：使用 NVM（推荐）

```bash
# 1. 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. 重新加载 shell 配置
# 如果使用 bash:
source ~/.bash_profile

# 如果使用 zsh（M1/M2 Mac 默认):
source ~/.zshrc

# 3. 验证 NVM 安装
nvm --version

# 4. 安装 Node.js LTS 版本
nvm install --lts

# 5. 验证 Node.js 安装
node --version
npm --version
```

#### 方法 2：使用 Homebrew

```bash
# 1. 检查是否有 Homebrew，如果没有先安装
which brew
# 如果没有，运行：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 使用 Homebrew 安装 Node.js
brew install node

# 3. 验证安装
node --version
npm --version
```

---

## 第二步：项目配置

### 1. 进入项目目录

```bash
cd "/Users/Omicron0314/Programme/v3 map"
```

### 2. 安装依赖包

```bash
# 使用 npm 安装所有依赖
npm install

# 或者使用 yarn（如果你已安装 yarn）
yarn install
```

**预期输出示例：**
```
added 100+ packages in X seconds
```

### 3. 验证文件结构

确保目录结构如下：
```
v3 map/
├── src/
│   ├── components/
│   │   └── InteractiveMap.jsx
│   ├── styles/
│   │   └── InteractiveMap.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── countries.geo.json
├── package.json
├── vite.config.js
└── index.html
```

---

## 第三步：启动开发服务器

### 最简单的方式

```bash
npm run dev
```

### 预期输出：

```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 在浏览器中查看

1. 打开浏览器（Chrome、Safari、Firefox 等）
2. 访问 `http://localhost:5173/`
3. 你应该会看到一个全屏的蓝色和紫色渐变背景的地图

---

## 第四步：测试交互功能

在浏览器中尝试以下操作：

✅ **拖拽地图** - 按住鼠标左键并拖动  
✅ **缩放地图** - 使用鼠标滚轮放大/缩小  
✅ **查看国家信息** - 将鼠标悬停在国家上方  
✅ **放大国家** - 单击任意国家  
✅ **重置视图** - 点击右上角的 "🔄 重置视图" 按钮

---

## 第五步（可选）：生产环境构建

当你准备好部署时，使用构建命令：

```bash
npm run build
```

这将创建一个优化的生产版本，输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

---

## 🔧 常见问题解决

### 问题 1：npm: command not found

**解决方案：**
```bash
# 检查 Node.js 安装
node --version

# 如果返回 command not found，说明 Node.js 未安装或 PATH 未配置
# 尝试重新启动终端，或重新安装 Node.js
```

### 问题 2：端口 5173 已被占用

**解决方案：**
```bash
# 方法 1: 使用其他端口
npm run dev -- --port 3000

# 方法 2: 关闭占用该端口的应用
# macOS 上查找并关闭占用端口的进程
lsof -i :5173
# 然后 kill -9 <PID>
```

### 问题 3：GeoJSON 文件加载失败

**检查清单：**
- [ ] `countries.geo.json` 文件是否存在于项目根目录
- [ ] GeoJSON 文件格式是否正确（JSON 格式）
- [ ] 在浏览器控制台检查是否有 CORS 错误
- [ ] 确保文件路径正确：`/countries.geo.json`

### 问题 4：热模块更新 (HMR) 不工作

**解决方案：**
```bash
# 清除 node_modules 和 package-lock.json 后重新安装
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 开发中的实用命令

### 代码检查

```bash
npm run lint
```

### 格式化代码（如果配置了格式化工具）

```bash
npx prettier --write src/
```

### 创建新组件时的目录结构

```bash
# 在 src/components/ 中创建新文件
src/components/YourComponent.jsx
src/styles/YourComponent.css
```

---

## 🌐 在其他设备上访问

### 从局域网访问（同个 Wi-Fi）

```bash
# 启动开发服务器时使用 --host 参数
npm run dev -- --host
```

然后你会看到类似的输出：
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

在同网络的其他设备上访问网络地址。

---

## 🐛 调试技巧

### 在浏览器开发者工具中调试

1. 打开 F12（开发者工具）
2. 查看 **Console** 标签中是否有错误
3. 使用 **Network** 标签检查网络请求
4. 在 **Sources** 标签中设置断点
5. 检查 **Elements** 标签中的 DOM 结构

### 查看 React 组件树

安装 React DevTools Chrome 扩展：
- [React DevTools for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/)

---

## ✅ 验证清单

在开始开发前，确保：

- [ ] Node.js 已安装 (`node --version` 返回版本号)
- [ ] npm 已安装 (`npm --version` 返回版本号)
- [ ] 进入正确的项目目录
- [ ] 运行了 `npm install`
- [ ] 开发服务器运行正常 (`npm run dev`)
- [ ] 可以在浏览器访问 `http://localhost:5173/`
- [ ] 可以在地图上交互（拖拽、缩放、点击）

---

## 📞 获取帮助

如果遇到问题：

1. **检查文档** - 查看 README.md 和注释代码
2. **查看控制台错误** - F12 打开开发者工具
3. **重新安装依赖** - `npm install`
4. **清理缓存** - 清除浏览器缓存和 npm 缓存

```bash
# 清除 npm 缓存
npm cache clean --force

# 清除依赖
rm -rf node_modules
npm install
```

---

**准备好了吗？现在运行 `npm install && npm run dev` 开始你的交互式地图之旅！** 🗺️✨
