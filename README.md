# KeyGuard Pro - AI密钥守护者

<div align="center">
  <h3>🔐 专业、安全、高效的AI API Key检测与验证平台</h3>
  <p>为您的AI API密钥安全保驾护航</p>
</div>

## ✨ 核心特性

### 🔍 多维度检测
- **单个Key检测**：快速验证单个API Key的有效性
- **批量检测**：支持并发批量检测，提升效率
- **自定义测试**：支持自定义API端点和请求模板

### 🚀 强大功能
- **31+服务商支持**：OpenAI、Claude、Gemini、百度文心、通义千问等
- **多格式输入**：支持纯文本、服务商:密钥、JSON三种输入格式
- **实时进度跟踪**：可视化检测进度和统计信息
- **智能过滤搜索**：按状态、关键词筛选结果
- **多格式导出**：支持JSON、CSV格式导出

### 🛡️ 安全保障
- **本地检测**：所有检测在浏览器本地进行，API Key永不上传
- **隐私保护**：零数据收集，完全离线运行
- **开源透明**：代码完全开源，可自行审查

## 🎯 支持的AI服务商

| 服务商 | 支持状态 | 特殊说明 |
|--------|----------|----------|
| **国际主流服务商** |
| 🤖 OpenAI | ✅ | 支持GPT系列模型检测 |
| 🧠 Anthropic (Claude) | ✅ | 支持Claude系列模型 |
| 🔍 Google AI (Gemini) | ✅ | 支持Gemini模型检测 |
| ☁️ Azure OpenAI | ✅ | 微软Azure平台 |
| 🧊 Cohere | ✅ | Cohere语言模型 |
| 🤗 HuggingFace | ✅ | HF Hub访问令牌 |
| **新增国际服务商** |
| 🔄 Replicate | ✅ | 开源模型托管平台 |
| 🤝 Together AI | ✅ | 高性能推理平台 |
| 🎆 Fireworks AI | ✅ | 快速推理优化 |
| ⚡ Groq | ✅ | 超快速LLM推理 |
| 🔍 Perplexity | ✅ | 在线搜索增强AI |
| 𝕏 xAI (Grok) | ✅ | Elon Musk的AI助手 |
| 🌟 Mistral AI | ✅ | 欧洲AI独角兽 |
| 🎨 Stability AI | ✅ | 图像生成AI |
| 🎬 Runway ML | ✅ | 视频生成AI |
| **国内主流服务商** |
| 🐻 百度文心 | ✅ | 支持文心大模型 |
| 🌟 通义千问 (Qwen) | ✅ | 阿里巴巴通义千问 |
| 🫘 豆包 (Doubao) | ✅ | 字节跳动豆包 |
| 🌙 Moonshot (Kimi) | ✅ | 月之暗面Kimi |
| 🔮 智谱AI (GLM) | ✅ | 智谱清言GLM |
| 🎭 MiniMax | ✅ | MiniMax模型 |
| **新增国内服务商** |
| 🔍 DeepSeek | ✅ | DeepSeek深度求索 |
| 🏢 零一万物 (01.AI) | ✅ | Yi系列模型 |
| 🐧 腾讯混元 | ✅ | 腾讯混元大模型 |
| 🔊 科大讯飞星火 | ✅ | 星火认知大模型 |
| 👁️ 商汤日日新 | ✅ | SenseChat模型 |
| 🏠 字节云雀 | ✅ | 字节跳动云雀 |
| ⭐ 零一万物 | ✅ | Yi中等规模模型 |
| 🌊 百川智能 | ✅ | Baichuan大模型 |
| ⛰️ 昆仑万维 | ✅ | 天工SkyWork |
| ☁️ 阿里云百炼 | ✅ | 阿里云模型平台 |
| 📱 华为盘古 | ✅ | 华为盘古大模型 |

## 🚀 快速开始

### 环境要求
- Node.js 18.0+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 📱 功能使用

### 单个Key检测
1. 选择"单个Key检测"标签
2. 选择AI服务商
3. 输入API Key
4. 配置请求格式（可选）
5. 点击"开始检测"

### 批量检测
1. 选择"批量检测"标签
2. 选择输入格式：
   - **纯文本**：每行一个Key
   - **服务商:密钥**：`openai:sk-xxx`
   - **JSON格式**：`{"service":"openai","key":"sk-xxx"}`
3. 配置高级设置（可选）
4. 输入或导入数据
5. 开始批量检测

### 自定义测试
1. 选择"自定义URL测试"标签
2. 配置API端点
3. 设置请求头和参数
4. 执行测试

## 🔧 技术栈

- **前端框架**：React 18 + TypeScript
- **样式方案**：Tailwind CSS
- **动画效果**：Framer Motion
- **图标库**：Lucide React
- **构建工具**：Next.js 14
- **代码规范**：ESLint + Prettier

## 📊 项目结构

```
src/
├── app/                    # Next.js App Router
├── components/             # React组件
│   ├── ui/                # 基础UI组件
│   ├── Header.tsx         # 头部组件
│   ├── SingleKeyDetector.tsx  # 单个检测
│   ├── BatchKeyDetector.tsx   # 批量检测
│   └── ProviderIcon.tsx   # 服务商图标
├── hooks/                 # 自定义Hooks
│   ├── useKeyDetection.ts # 检测逻辑
│   ├── useDarkMode.ts     # 暗色模式
│   └── useTemplates.ts    # 模板管理
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
│   ├── keyValidator.ts    # Key验证器
│   ├── batchProcessor.ts  # 批量处理器
│   └── exportHelper.ts    # 导出助手
└── styles/               # 样式文件
```

## 🔒 安全性说明

KeyGuard Pro 采用完全本地化的安全架构：

- ✅ **零数据上传**：API Key仅在浏览器本地处理
- ✅ **无服务器依赖**：完全静态部署，无后端服务
- ✅ **开源透明**：所有代码开源，可自行审查
- ✅ **隐私保护**：不收集任何用户数据
- ✅ **离线运行**：支持完全离线使用

## 📈 性能优化

- 🚀 **并发控制**：智能控制并发数量，避免频率限制
- 🔄 **自动重试**：失败请求自动重试，提高成功率
- 💾 **内存管理**：大数据量智能分批处理
- ⚡ **响应优化**：虚拟化长列表，保证界面流畅

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交Pull Request

## 📝 版本历史

### v2.0.0 (最新)
- ✨ 新增批量检测功能
- 🎨 全新的UI设计和用户体验
- 🔧 支持高级配置选项
- 📊 增强的统计和导出功能
- 🌙 完善的暗色模式支持

### v1.0.0
- 🎉 基础单个Key检测功能
- 🔍 支持主流AI服务商
- 🛡️ 本地安全检测架构

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

<div align="center">
  <p>🔐 <strong>KeyGuard Pro</strong> - 您的AI密钥安全守护者</p>
  <p>Made with ❤️ for AI developers</p>
</div> 