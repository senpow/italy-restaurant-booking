# Voice AI 集成指南 - Vapi/Retell

本文档提供完整的Voice AI（Vapi.ai / Retell AI）与餐厅预订系统集成的配置说明。

## 目录

1. [API端点概览](#api端点概览)
2. [Vapi配置步骤](#vapi配置步骤)
3. [Retell配置步骤](#retell配置步骤)
4. [API详细文档](#api详细文档)
5. [对话流程建议](#对话流程建议)
6. [测试与调试](#测试与调试)

---

## API端点概览

部署完成后，Cloud Functions会生成以下两个API端点：

```
检查可用性：
https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability

创建预订：
https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation
```

> **注意**：实际URL中的region（如us-central1）可能不同，以部署时返回的URL为准。

---

## Vapi配置步骤

### 1. 创建Function

登录Vapi.ai控制台，进入Functions页面：

1. 点击 **"New Function"**
2. 选择 **"Custom Function"**

### 2. 配置checkAvailability Function

**Function Name**: `checkAvailability`

**Endpoint URL**: 
```
https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability
```

**HTTP Method**: `POST`

**Request Schema**:
```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "预订日期，格式：YYYY-MM-DD，例如：2025-11-25"
    },
    "time": {
      "type": "string",
      "description": "预订时间，格式：HH:mm，必须是以下时间之一：12:00, 12:30, 13:00, 13:30, 14:00, 18:00, 18:30, 19:00, 19:30, 20:00, 20:30"
    },
    "partySize": {
      "type": "number",
      "description": "用餐人数，1-6人"
    }
  },
  "required": ["date", "time", "partySize"]
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean",
      "description": "是否有空位"
    },
    "alternatives": {
      "type": "array",
      "items": { "type": "string" },
      "description": "如果不可用，返回当天其他可用时间段"
    },
    "message": {
      "type": "string",
      "description": "给用户的回复消息"
    }
  }
}
```

### 3. 配置createReservation Function

**Function Name**: `createReservation`

**Endpoint URL**: 
```
https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation
```

**HTTP Method**: `POST`

**Request Schema**:
```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "预订日期，格式：YYYY-MM-DD"
    },
    "time": {
      "type": "string",
      "description": "预订时间，格式：HH:mm"
    },
    "partySize": {
      "type": "number",
      "description": "用餐人数"
    },
    "name": {
      "type": "string",
      "description": "客人姓名"
    },
    "phone": {
      "type": "string",
      "description": "联系电话"
    },
    "email": {
      "type": "string",
      "description": "电子邮箱（可选）"
    }
  },
  "required": ["date", "time", "partySize", "name", "phone"]
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "预订是否成功"
    },
    "reservationId": {
      "type": "string",
      "description": "预订确认号"
    },
    "message": {
      "type": "string",
      "description": "确认消息"
    }
  }
}
```

### 4. 配置对话流程

在Vapi的Assistant配置中，设置对话流程：

```
System Prompt示例：

你是Trattoria Bella Vista餐厅的AI预订助手。你的任务是帮助客人预订座位。

预订流程：
1. 欢迎客人，询问预订日期
2. 询问用餐人数（1-6人）
3. 询问用餐时间（午餐12:00-14:00，晚餐18:00-20:30）
4. 调用checkAvailability检查可用性
5. 如果可用，收集客人姓名和电话
6. 调用createReservation创建预订
7. 告知客人预订确认号

注意事项：
- 始终使用自然、友好的语气
- 如果请求的时间不可用，主动提供替代时间
- 确认所有信息后再创建预订
```

---

## Retell配置步骤

### 1. 配置Webhook

登录Retell AI控制台：

1. 进入 **Tools** 或 **Custom Actions**
2. 创建新的Custom Action

### 2. 配置检查可用性Action

**Action Name**: `check_availability`

**Webhook URL**: 
```
https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability
```

**Parameters**:
- `date` (string, required): 预订日期
- `time` (string, required): 预订时间  
- `partySize` (number, required): 用餐人数

### 3. 配置创建预订Action

**Action Name**: `create_reservation`

**Webhook URL**:
```
https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation
```

**Parameters**:
- `date` (string, required): 预订日期
- `time` (string, required): 预订时间
- `partySize` (number, required): 用餐人数
- `name` (string, required): 客人姓名
- `phone` (string, required): 联系电话
- `email` (string, optional): 电子邮箱

---

## API详细文档

### checkAvailability

**请求示例**:
```bash
curl -X POST https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-25",
    "time": "18:00",
    "partySize": 2
  }'
```

**成功响应（有空位）**:
```json
{
  "available": true,
  "message": "好的，我们在18:00有位置，可以容纳2位客人。"
}
```

**成功响应（无空位，有替代方案）**:
```json
{
  "available": false,
  "alternatives": ["18:30", "19:00", "19:30", "20:00"],
  "message": "抱歉，18:00已经订满了，但我们在18:30、19:00、19:30、20:00还有空位。您看这些时间合适吗？"
}
```

**成功响应（当天全满）**:
```json
{
  "available": false,
  "alternatives": [],
  "message": "非常抱歉，2025-11-25当天所有时间段都已订满。您可以选择其他日期吗？"
}
```

**错误响应**:
```json
{
  "error": "缺少必需参数",
  "message": "请提供日期、时间和人数信息。"
}
```

### createReservation

**请求示例**:
```bash
curl -X POST https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-25",
    "time": "18:00",
    "partySize": 2,
    "name": "张三",
    "phone": "+86 138 0000 0000",
    "email": "zhang@example.com"
  }'
```

**成功响应**:
```json
{
  "success": true,
  "reservationId": "abc123xyz789",
  "message": "预订成功！张三先生/女士，您的预订已确认。11月25日18:00，2位。我们期待您的光临！"
}
```

**失败响应（时间已满）**:
```json
{
  "success": false,
  "message": "抱歉，该时间段已经订满了。请选择其他时间。"
}
```

---

## 对话流程建议

### 完整对话流程

```
1. AI: "您好，欢迎致电Trattoria Bella Vista！我是AI助手，很高兴为您预订座位。请问您想预订哪一天？"
   
2. 客户: "明天"
   AI: "好的。请问几位用餐？"
   
3. 客户: "两位"
   AI: "明白了，两位客人。我们的营业时间是午餐12:00到14:00，晚餐18:00到20:30。您想预订什么时候？"
   
4. 客户: "晚上7点"
   AI: [调用checkAvailability API]
   
   场景A（有空位）:
   AI: "太好了！晚上7点有位置。请问您贵姓？"
   
   场景B（无空位但有替代方案）:
   AI: "抱歉，晚上7点已经订满了，但我们在6点半、8点和8点半还有空位。您看哪个时间合适？"
   
   场景C（当天全满）:
   AI: "非常抱歉，明天所有时间段都已经订满了。您可以选择后天或其他日期吗？"

5. 客户: "好的，就7点"（或选择替代时间）
   AI: "好的。请问您的姓名？"
   
6. 客户: "张三"
   AI: "张三先生/女士，请问您的联系电话是？"
   
7. 客户: "138 0000 0000"
   AI: "好的。让我为您确认一下：明天晚上7点，两位客人，对吗？"
   
8. 客户: "对的"
   AI: [调用createReservation API]
   AI: "预订成功！张三先生，您的预订已确认。11月25日19:00，2位。确认号是abc123。我们期待您的光临！"
```

### 错误处理

**API调用失败**:
```
"抱歉，系统暂时出现了一点问题。请您稍后再试，或者拨打我们的人工服务电话进行预订。"
```

**客户多次更改需求**:
```
"没问题，让我重新为您查询..."
```

**听不清客户说话**:
```
"抱歉，我没听清楚。您能再说一遍吗？"
```

---

## 测试与调试

### 使用Postman测试

1. 打开Postman，创建新请求
2. 方法：POST
3. URL：粘贴Cloud Functions URL
4. Headers：`Content-Type: application/json`
5. Body：选择raw，输入JSON数据
6. 点击Send

### 使用curl测试

**测试可用性检查**:
```bash
curl -X POST https://us-central1-italien-res-bc870.cloudfunctions.net/checkAvailability \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-25","time":"18:00","partySize":2}'
```

**测试创建预订**:
```bash
curl -X POST https://us-central1-italien-res-bc870.cloudfunctions.net/createReservation \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-25","time":"18:00","partySize":2,"name":"测试用户","phone":"+86 138 0000 0000"}'
```

### 查看日志

Firebase Console查看日志：
1. 登录Firebase Console
2. 进入Functions页面
3. 点击对应的函数navn
4. 查看Logs标签

关键日志信息：
- `检查可用性`: 记录查询请求
- `找到可用桌位`: 记录成功找到空位
- `找到替代时间`: 记录替代方案
- `预订创建成功`: 记录预订详情

### 常见问题

**Q: API返回400错误**
A: 检查请求参数格式是否正确，特别是date格式（YYYY-MM-DD）和time是否在营业时间内

**Q: API返回409错误**
A: 该时间段已被预订，使用checkAvailability查询其他可用时间

**Q: API返回500错误**
A: 服务器内部错误，查看Firebase日志进行调试

**Q: Vapi无法连接到webhook**
A: 确认URL正确，检查Cloud Functions是否已成功部署

---

## 营业时间参考

**午餐**: 12:00, 12:30, 13:00, 13:30, 14:00

**晚餐**: 18:00, 18:30, 19:00, 19:30, 20:00, 20:30

**餐桌配置**:
- 1号桌：3人（窗边）
- 2号桌：3人（窗边）
- 3号桌：2人（角落）
- 4号桌：4人（中央）
- 5号桌：6人（家庭区）
- 6号桌：6人（家庭区）

---

## 技术支持

如有问题，请：
1. 查看Firebase Functions日志
2. 使用curl/Postman测试API端点
3. 检查Vapi/Retell配置是否正确
4. 验证请求参数格式

祝您集成顺利！🎉
