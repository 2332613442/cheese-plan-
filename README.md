# 奶酪计划（Cheese Plan）

一款帮助你管理食品有效期的 PWA 应用，支持临期提醒、社区交流、附近分享和捐赠记录。

## 功能特性

- **食品管理**：记录食品名称、分类、生产日期、有效期，支持条形码扫描和拍照
- **临期提醒**：通过 Web Notification API 在设定天数前发送到期提醒
- **定时器页面**：以时间轴方式展示临期食品，支持按天数范围筛选
- **社区交流**：发布帖子、评论、点赞，与其他用户互动
- **附近分享**：将家中多余/临期食品发布出去供附近人领取
- **捐赠记录**：记录捐赠历史，通过迷宫动画展示累计帮助人数
- **云端同步**：登录后可将本地食品数据上传到服务器或从云端恢复
- **个人主页**：查看统计数据、过期食品、最近添加记录

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并根据实际情况修改：

```bash
cp .env.example .env.local
```

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | `http://47.116.111.139/api` |

## 技术栈

- **框架**：React 19 + Vite 8
- **样式**：TailwindCSS v4
- **存储**：localStorage（食品、帖子、设置、用户信息）
- **API**：自定义 REST API（JWT 鉴权）
- **条形码扫描**：html5-qrcode
- **通知**：Web Notification API
- **部署**：GitHub Pages（`base: '/cheese-plan-/'`）

## 项目结构

```
src/
├── components/      # 通用组件（弹窗、表单、卡片等）
├── data/            # 静态数据（分类、时间范围）
├── pages/           # 页面组件（首页、定时器、社区、捐赠、个人主页）
└── utils/           # 工具函数（本地存储、API、通知、食品状态计算）
```

## 数据说明

所有食品数据默认存储在浏览器 `localStorage` 中，key 为 `cheese-plan-foods`。
登录后可通过"个人主页 → 云端同步"将数据上传到服务器。

## License

MIT
