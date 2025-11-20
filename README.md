# Trattoria Bella Vista - 餐厅预订系统

意大利餐厅预订管理系统，支持Web界面预订和Voice AI电话预订功能。

## 功能特点

### 📱 前端功能
- 用户注册和登录
- 实时预订系统
- 可视化餐桌选择
- 预订管理Dashboard
- 管理员后台

### 🤖 Voice AI集成
- Vapi/Retell语音AI电话预订
- 实时可用性检查
- 智能桌子分配
- 自动替代时间建议
- 120分钟预订时长管理

### 🔒 安全功能
- API Key验证
- Firebase Authentication
- 输入验证
- 时间重叠检测

## 技术栈

- **前端**: React + TypeScript + Vite
- **后端**: Firebase Cloud Functions
- **数据库**: Firebase Firestore
- **认证**: Firebase Authentication
- **部署**: Firebase Hosting

## API端点

### checkAvailability
检查指定时间的餐桌可用性

**URL**: `https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability`

### createReservation
创建新预订

**URL**: `https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation`

## 本地开发

```bash
npm install
npm run dev
```

## Voice AI配置

详细配置请参考 [vapi-integration-guide.md](vapi-integration-guide.md)

## 许可证

MIT License
