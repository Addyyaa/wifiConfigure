# CLAUDE.md

本文件为Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个基于React的IoT设备WiFi配网应用程序。该应用提供现代化的多语言界面，支持WiFi网络配置、深色/浅色模式和设备组管理。

## 开发命令

### 基本命令
- `npm run dev` - 启动开发服务器 (Vite) 端口5173
- `npm run build` - 生产环境构建
- `npm run preview` - 本地预览生产构建

### 代码检查和类型检查
- `eslint` - 已配置ESLint但无特定lint脚本
- 未配置TypeScript检查 (项目使用JSX)

## 架构概述

### 核心技术栈
- **React 18** 配合Vite构建工具
- **React Router DOM 7.6.3** 用于路由管理
- **Styled Components** 用于CSS-in-JS样式
- **Framer Motion** 用于动画效果
- **i18next** 用于国际化 (中文/英文)
- **Axios** 用于API通信

### 关键架构模式

#### 1. 基于Context的状态管理
- `AppContext.jsx` 管理全局状态 (WiFi列表、屏幕ID、深色模式)
- 深色模式自动跟随系统偏好，除非手动覆盖
- 全局使用React Context API模式

#### 2. 受保护路由系统
- 特定页面需要身份验证 (如 `/create-groups`)
- 基于Token的身份验证，自动处理401错误
- WiFi配置和Pintura云服务使用独立的API系统

#### 3. API层架构
应用程序有两个不同的API系统：

**WiFi配置APIs** (本地设备):
- 基础URL: `http://[hostname]:80/api`
- 端点: `/wifi-list`, `/wifi-config`, `/wifi-status`, `/getScreenId`

**Pintura云APIs** (远程服务):
- 多区域支持 (中国/美国/开发环境)
- JWT令牌认证，自动刷新
- 用户登录和设备组管理的端点

#### 4. 国际化模式
- 从浏览器/localStorage检测语言
- 使用国家旗帜图标进行语言选择
- 翻译存储在专用的`translations.js`文件中

## 关键组件和文件

### 核心应用文件
- `src/App.jsx` - 主路由配置
- `src/main.jsx` - 应用入口点，包含context提供者
- `src/components/AppContext.jsx` - 全局状态管理
- `src/api.js` - 所有API函数和axios配置

### 页面组件
- `src/pages/Home.jsx` - 主WiFi配置界面
- `src/pages/Login.jsx` - 用户认证 (区域选择、手机号/邮箱)
- `src/pages/CreateGroups.jsx` - 设备组管理

### 关键UI组件
- `src/components/WiFiConfig.jsx` - 主WiFi配置流程
- `src/components/LanguageSwitcher.jsx` - 带国家旗帜的语言切换
- `src/components/common/SignalStrength.jsx` - WiFi信号强度可视化
- `src/components/common/Modal.jsx` - 可复用的模态框组件

## 开发工作流模式

### WiFi配置流程
1. 应用加载时获取设备屏幕ID
2. 扫描可用WiFi网络
3. 用户选择网络并输入密码
4. 轮询连接状态直至成功/失败
5. 处理各种错误状态 (密码错误、超时等)

### 认证流程
1. 区域选择 (中国/美国) 决定API端点
2. 手机号 (带区号) 或邮箱登录
3. JWT令牌存储在localStorage
4. 自动令牌验证和401处理

### 开发模式切换
- 在首页点击主标题7次切换到开发API端点
- 用于针对开发服务器进行测试

## API集成说明

### WiFi配置APIs
- `postWifiConfig`函数当前使用GET请求传参 (应该使用POST)
- 状态轮询期望JSON响应格式: `{"status": "connecting|success|password_error|timeout|error"}`
- SSID名称经过URL编码，需要解码显示

### Pintura云APIs
- 基于区域的自动URL切换 (中国/美国)
- 令牌刷新处理，401时重定向到登录
- 请求/响应拦截器处理认证头

## 样式和主题

### 深色模式实现
- 加载时检测系统偏好
- 手动覆盖功能，会话期间持续
- 主题上下文在整个组件树中可用
- CSS变量和styled-components用于主题切换

### 响应式设计
- 使用styled-components的移动优先方法
- 组件级样式中的断点处理
- 设备配置的触摸友好界面

## 重要开发说明

### 环境配置
- 开发服务器允许外部访问 (host: '0.0.0.0')
- 开发期间API调用的代理配置
- 构建使用相对路径进行静态部署

### 错误处理模式
- 网络超时和连接问题
- 密码验证和重试流程
- 令牌过期和重新认证
- WiFi连接状态轮询，适当清理

### 性能考虑
- Framer Motion动画针对移动设备优化
- 通过正确的context使用实现高效重新渲染
- Axios拦截器全局处理常见API模式

## 测试和质量

项目当前未配置测试框架。添加测试时，考虑：
- WiFi配置流程的组件测试
- 本地和云服务的API集成测试
- 两种语言变体的国际化测试