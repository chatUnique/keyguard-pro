# KeyGuard Pro - 批量检测功能使用指南

## 概述

KeyGuard Pro 现已支持强大的批量检测功能，允许您同时检测多个 API Key，并提供灵活的配置选项。

## 功能特性

### ✨ 核心功能
- **多格式输入支持**：纯文本、服务商:密钥、JSON格式
- **服务商选择**：支持12+主流AI服务商
- **并发控制**：可配置并发数量和重试策略
- **实时进度**：实时显示检测进度和统计信息
- **智能过滤**：支持按状态和关键词搜索结果
- **多格式导出**：支持JSON和CSV格式导出

### 🔧 高级设置
- **默认服务商**：为未指定服务商的Key设置默认值
- **请求格式**：选择原生格式或OpenAI兼容格式
- **测试模型**：指定特定模型进行测试

## 输入格式支持

### 1. 纯文本格式
每行一个API Key，使用默认服务商设置：
```
sk-proj-1234567890abcdef...
sk-ant-api03-1234567890...
AIzaSyA1234567890abcdef...
```

### 2. 服务商:密钥格式
格式：`服务商:API_Key`
```
openai:sk-proj-1234567890abcdef...
anthropic:sk-ant-api03-1234567890...
google:AIzaSyA1234567890abcdef...
baidu:your_baidu_api_key
qwen:your_qwen_api_key
doubao:your_doubao_api_key
moonshot:your_moonshot_api_key
zhipu:your_zhipu_api_key
minimax:your_minimax_api_key
azure:your_azure_api_key
cohere:your_cohere_api_key
huggingface:your_hf_token
```

### 3. JSON格式
支持详细配置每个Key：
```json
{"service":"openai","key":"sk-proj-1234567890abcdef..."}
{"service":"anthropic","key":"sk-ant-api03-1234567890..."}
{"service":"custom","key":"your_custom_key","customUrl":"https://api.custom.com/v1/chat/completions"}
```

## 支持的服务商

| 服务商 | 标识符 | 别名 |
|--------|--------|------|
| **国际主流服务商** |
| OpenAI | `openai` | - |
| Anthropic | `anthropic` | `claude` |
| Google AI | `google` | `gemini` |
| Azure OpenAI | `azure` | - |
| Cohere | `cohere` | - |
| HuggingFace | `huggingface` | `hf` |
| **新增国际服务商** |
| Replicate | `replicate` | - |
| Together AI | `together` | - |
| Fireworks AI | `fireworks` | - |
| Groq | `groq` | - |
| Perplexity | `perplexity` | - |
| xAI (Grok) | `xai` | `grok` |
| Mistral AI | `mistral` | - |
| Stability AI | `stability` | - |
| Runway ML | `runway` | - |
| **国内主流服务商** |
| 百度文心 | `baidu` | `wenxin` |
| 通义千问 | `qwen` | `tongyi` |
| 豆包 | `doubao` | - |
| Moonshot | `moonshot` | `kimi` |
| 智谱AI | `zhipu` | `glm` |
| MiniMax | `minimax` | - |
| **新增国内服务商** |
| DeepSeek | `deepseek` | - |
| 零一万物 | `oneai` | `01ai`, `yi` |
| 腾讯混元 | `tencent` | `hunyuan` |
| 科大讯飞星火 | `iflytek` | `spark`, `xinghuo` |
| 商汤日日新 | `sensetime` | - |
| 字节云雀 | `bytedance` | `yunque` |
| 零一万物 | `lingyi` | - |
| 百川智能 | `baichuan` | - |
| 昆仑万维 | `kunlun` | `skywork` |
| 阿里云百炼 | `alibaba` | `aliyun` |
| 华为盘古 | `huawei` | `pangu` |
| **新增主流服务商** |
| Ollama | `ollama` | - |
| Meta AI | `meta` | `llama` |
| Coze | `coze` | - |
| GitHub Copilot | `github` | `copilot` |
| **新增其他服务商** |
| Cline | `cline` | - |
| 腾讯混元 | `hunyuan` | - |
| 字节元宝 | `yuanbao` | - |
| 火山引擎 | `volcengine` | - |
| Midjourney | `midjourney` | - |

## 使用步骤

### 1. 选择输入格式
在"输入格式"下拉菜单中选择合适的格式：
- **纯文本格式**：最简单，每行一个Key
- **服务商:密钥格式**：可以为每个Key指定不同服务商
- **JSON格式**：最灵活，支持自定义URL等高级配置

### 2. 输入API Key数据
- 直接在文本框中输入
- 或点击"从文件导入"按钮导入.txt、.json、.csv文件

### 3. 配置高级设置（可选）
点击"高级设置"展开配置选项：
- **默认服务商**：为纯文本格式的Key设置默认服务商
- **默认请求格式**：选择API请求格式（原生/OpenAI兼容）
- **默认测试模型**：指定测试用的模型名称

### 4. 开始检测
点击"开始检测"按钮启动批量验证，支持：
- **暂停/继续**：可随时暂停和恢复检测
- **停止**：完全停止当前检测任务
- **实时进度**：查看检测进度和统计信息

### 5. 查看结果
检测完成后可以：
- **搜索过滤**：按关键词搜索特定Key
- **状态过滤**：按有效性状态筛选结果
- **导出数据**：导出为JSON或CSV格式

## 配置选项

### 并发设置
- **默认并发数**：5（可在代码中调整）
- **最大重试次数**：3次
- **重试延迟**：1秒
- **超时时间**：30秒

### 导出选项
- **JSON格式**：完整的结果数据，包含所有检测信息
- **CSV格式**：表格格式，适合在Excel中查看

## 安全性说明

- ✅ **本地处理**：所有检测在浏览器本地进行
- ✅ **数据不上传**：API Key永不离开您的设备
- ✅ **内存管理**：自动管理内存使用，避免浏览器卡顿
- ✅ **错误处理**：完善的错误处理和重试机制

## 故障排除

### 常见问题

1. **导入文件失败**
   - 确保文件格式正确（.txt, .json, .csv）
   - 检查文件编码是否为UTF-8

2. **检测速度慢**
   - 某些服务商可能有速率限制
   - 网络状况会影响检测速度

3. **部分Key显示错误**
   - 检查Key格式是否正确
   - 确认服务商标识符是否正确

4. **内存不足**
   - 大批量检测建议分批进行
   - 及时清空不需要的结果

### 性能建议

- **小批量**（<100个）：直接检测
- **中批量**（100-1000个）：建议分组检测
- **大批量**（>1000个）：考虑分批上传

## 示例场景

### 场景1：混合服务商检测
```
openai:sk-proj-1234567890abcdef...
claude:sk-ant-api03-1234567890...
sk-1234567890abcdef...
gemini:AIzaSyA1234567890abcdef...
```

### 场景2：自定义API端点
```json
{"service":"custom","key":"your_api_key","customUrl":"https://api.example.com/v1/chat/completions"}
{"service":"openai","key":"sk-proj-1234567890abcdef..."}
```

### 场景3：纯文本批量检测
```
sk-proj-1234567890abcdef...
sk-proj-0987654321fedcba...
sk-proj-1111222233334444...
```

---

 