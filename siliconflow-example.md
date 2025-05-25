# 硅基流动余额查询功能

## 功能概述

已为硅基流动(SiliconFlow)适配专用的余额查询功能，支持获取用户账户信息和余额数据。

## API 端点

```
GET https://api.siliconflow.cn/v1/user/info
Authorization: Bearer {apiKey}
Content-Type: application/json
```

## 返回数据结构

```json
{
  "code": 20000,
  "message": "OK",
  "status": true,
  "data": {
    "id": "userid",
    "name": "username",
    "image": "user_avatar_image_url",
    "email": "user_email_address",
    "isAdmin": false,
    "balance": "0.88",
    "status": "normal",
    "introduction": "user_introduction",
    "role": "user_role",
    "chargeBalance": "88.00",
    "totalBalance": "88.88"
  }
}
```

## 技术实现

### 1. 验证方法

创建了专用的 `validateSiliconFlow` 方法：

```typescript
private static async validateSiliconFlow(
  apiKey: string, 
  format: RequestFormat, 
  checkBalance: boolean
): Promise<ApiKeyValidationResult>
```

### 2. 验证流程

1. **模型列表验证**: 首先调用 `/v1/models` 端点验证API Key有效性
2. **用户信息查询**: 如果启用余额查询，调用 `/v1/user/info` 获取账户信息
3. **响应状态检查**: 验证 `code === 20000` 和 `status === true`
4. **数据提取**: 从 `data` 字段中提取余额和用户信息
5. **结果返回**: 返回包含模型列表、余额和账户信息的完整结果

### 3. 余额字段支持

硅基流动提供三种余额字段（优先级递减）：
- `totalBalance` - 总余额（推荐使用）
- `balance` - 可用余额
- `chargeBalance` - 充值余额

### 4. 用户信息字段

提取并格式化以下用户信息：
- 用户ID (`id`)
- 用户名 (`name`)
- 邮箱 (`email`)
- 管理员状态 (`isAdmin`)
- 账户状态 (`status`)
- 用户角色 (`role`)
- 个人简介 (`introduction`)
- 头像URL (`image`)

## UI 显示

### 余额显示
- 绿色突出卡片显示
- 格式化为美元金额（保留2位小数）
- 图标：💰 Database 图标

### 账户信息显示
- 蓝色信息卡片
- 包含用户ID、用户名、邮箱、角色、状态、管理员权限等信息
- 详细的余额明细（总余额、可用余额、充值余额）
- 仅在硅基流动服务商时显示

## 使用方法

1. 选择"硅基流动"作为服务商
2. 输入有效的API Key
3. 展开"高级设置"
4. 开启"查询账户余额"开关
5. 点击"开始检测"
6. 查看结果中的余额和详细账户信息

## 错误处理

- 检查API响应的 `code` 和 `status` 字段
- 用户信息查询失败不影响主要验证
- 提供控制台警告日志
- 优雅降级，仅影响余额显示部分

## 扩展性

代码结构支持轻松添加其他硅基流动特有的功能：
- 用户头像显示
- 个人简介信息
- 管理员权限标识
- 更详细的余额分析

## 示例响应

### 成功响应
```json
{
  "isValid": true,
  "provider": "siliconflow",
  "status": "valid",
  "message": "API Key验证成功",
  "details": {
    "models": ["deepseek-chat", "qwen-72b-chat", "llama-3-8b-instruct"],
    "balance": 88.88,
    "accountInfo": {
      "userId": "userid",
      "username": "username",
      "email": "user@example.com",
      "isAdmin": false,
      "status": "normal",
      "role": "user_role",
      "introduction": "user_introduction",
      "avatar": "user_avatar_image_url",
      "balanceDetails": {
        "balance": "0.88",
        "chargeBalance": "88.00",
        "totalBalance": "88.88"
      },
      "rawUserInfo": { /* 完整原始响应的data字段 */ }
    }
  }
}
```

## 注意事项

1. **权限要求**: API Key需要有查询用户信息的权限
2. **网络要求**: 需要能够访问 `api.siliconflow.cn` 域名
3. **错误处理**: 查询失败时会在控制台输出警告信息
4. **数据格式**: 余额自动转换为数字格式进行计算和显示 