/**
 * AI模型配置文件
 * 定义各服务商支持的模型列表和相关配置
 */

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  description?: string;
  pricing?: {
    input: number;  // 每1K tokens价格
    output: number; // 每1K tokens价格
  };
}

// OpenAI 模型
export const openaiModels: ModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    contextLength: 8192,
    description: 'More capable than any GPT-3.5 model',
    pricing: { input: 0.03, output: 0.06 }
  },
  {
    id: 'gpt-4-1106-preview',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextLength: 128000,
    description: 'GPT-4 Turbo with improved instruction following',
    pricing: { input: 0.01, output: 0.03 }
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    contextLength: 4096,
    description: 'Most capable GPT-3.5 model',
    pricing: { input: 0.0015, output: 0.002 }
  },
  {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    provider: 'OpenAI',
    contextLength: 16384,
    description: 'Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context',
    pricing: { input: 0.003, output: 0.004 }
  }
];

// Anthropic 模型
export const anthropicModels: ModelInfo[] = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextLength: 200000,
    description: 'Most powerful model for highly complex tasks',
    pricing: { input: 0.015, output: 0.075 }
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    contextLength: 200000,
    description: 'Ideal balance of intelligence and speed',
    pricing: { input: 0.003, output: 0.015 }
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextLength: 200000,
    description: 'Fastest and most compact model for near-instant responsiveness',
    pricing: { input: 0.00025, output: 0.00125 }
  }
];

// Google AI 模型
export const googleModels: ModelInfo[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    contextLength: 32768,
    description: 'Best for scaling across a wide range of tasks'
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'Google',
    contextLength: 16384,
    description: 'Multimodal model that accepts text and images'
  }
];

// 百度模型
export const baiduModels: ModelInfo[] = [
  {
    id: 'ERNIE-Bot',
    name: '文心一言',
    provider: '百度',
    contextLength: 5120,
    description: '百度自研的知识增强大语言模型'
  },
  {
    id: 'ERNIE-Bot-turbo',
    name: '文心一言 Turbo',
    provider: '百度',
    contextLength: 5120,
    description: '更快的文心一言模型'
  }
];

// 通义千问模型
export const qwenModels: ModelInfo[] = [
  {
    id: 'qwen-plus',
    name: '通义千问Plus',
    provider: '阿里云',
    contextLength: 32768,
    description: '通义千问超大规模语言模型增强版'
  },
  {
    id: 'qwen-turbo',
    name: '通义千问Turbo',
    provider: '阿里云',
    contextLength: 8192,
    description: '通义千问超大规模语言模型高速版'
  }
];

// 豆包模型
export const doubaoModels: ModelInfo[] = [
  {
    id: 'ep-20240611112529-zg4vr',
    name: '豆包',
    provider: '字节跳动',
    contextLength: 4096,
    description: '字节跳动豆包大语言模型'
  }
];

// 月之暗面模型
export const moonshotModels: ModelInfo[] = [
  {
    id: 'moonshot-v1-8k',
    name: 'Moonshot v1 8K',
    provider: '月之暗面',
    contextLength: 8192,
    description: 'Moonshot 8K上下文模型'
  },
  {
    id: 'moonshot-v1-32k',
    name: 'Moonshot v1 32K',
    provider: '月之暗面',
    contextLength: 32768,
    description: 'Moonshot 32K上下文模型'
  },
  {
    id: 'moonshot-v1-128k',
    name: 'Moonshot v1 128K',
    provider: '月之暗面',
    contextLength: 131072,
    description: 'Moonshot 128K上下文模型'
  }
];

// 智谱AI模型
export const zhipuModels: ModelInfo[] = [
  {
    id: 'glm-4',
    name: 'GLM-4',
    provider: '智谱AI',
    contextLength: 128000,
    description: '智谱AI最新一代基座大模型GLM-4'
  },
  {
    id: 'glm-3-turbo',
    name: 'GLM-3-Turbo',
    provider: '智谱AI',
    contextLength: 8192,
    description: '智谱AI高效模型'
  }
];

// MiniMax模型
export const minimaxModels: ModelInfo[] = [
  {
    id: 'abab6-chat',
    name: 'abab6-chat',
    provider: 'MiniMax',
    contextLength: 8192,
    description: 'MiniMax大语言模型'
  }
];

// Azure OpenAI模型
export const azureModels: ModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 (Azure)',
    provider: 'Azure OpenAI',
    contextLength: 8192,
    description: 'Azure部署的GPT-4模型'
  },
  {
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo (Azure)',
    provider: 'Azure OpenAI',
    contextLength: 4096,
    description: 'Azure部署的GPT-3.5 Turbo模型'
  }
];

// Cohere模型
export const cohereModels: ModelInfo[] = [
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    contextLength: 128000,
    description: 'Cohere最强大的命令模型',
    pricing: { input: 0.003, output: 0.015 }
  },
  {
    id: 'command-r',
    name: 'Command R',
    provider: 'Cohere',
    contextLength: 128000,
    description: 'Cohere平衡性能的命令模型',
    pricing: { input: 0.0005, output: 0.0015 }
  }
];

// Replicate模型
export const replicateModels: ModelInfo[] = [
  {
    id: 'meta/llama-2-70b-chat',
    name: 'Llama 2 70B Chat',
    provider: 'Replicate',
    contextLength: 4096,
    description: 'Meta的开源Llama 2 70B聊天模型'
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct-v0.1',
    name: 'Mixtral 8x7B Instruct',
    provider: 'Replicate',
    contextLength: 32768,
    description: 'Mistral AI的专家混合模型'
  }
];

// Together AI模型
export const togetherModels: ModelInfo[] = [
  {
    id: 'meta-llama/Llama-2-70b-chat-hf',
    name: 'Llama 2 70B Chat',
    provider: 'Together AI',
    contextLength: 4096,
    description: 'Meta Llama 2 70B聊天模型'
  },
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B Instruct',
    provider: 'Together AI',
    contextLength: 32768,
    description: 'Mistral AI混合专家模型'
  }
];

// Fireworks AI模型
export const fireworksModels: ModelInfo[] = [
  {
    id: 'accounts/fireworks/models/llama-v2-70b-chat',
    name: 'Llama 2 70B Chat',
    provider: 'Fireworks AI',
    contextLength: 4096,
    description: 'Fireworks优化的Llama 2 70B'
  },
  {
    id: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'Fireworks AI',
    contextLength: 32768,
    description: 'Fireworks优化的Mixtral模型'
  }
];

// Groq模型
export const groqModels: ModelInfo[] = [
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B',
    provider: 'Groq',
    contextLength: 8192,
    description: '超快速推理的Llama 3 70B'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'Groq',
    contextLength: 32768,
    description: '超快速推理的Mixtral 8x7B'
  }
];

// Perplexity模型
export const perplexityModels: ModelInfo[] = [
  {
    id: 'llama-3-sonar-large-32k-online',
    name: 'Sonar Large 32K Online',
    provider: 'Perplexity',
    contextLength: 32768,
    description: '具有在线搜索能力的大型模型'
  },
  {
    id: 'llama-3-sonar-small-32k-online',
    name: 'Sonar Small 32K Online',
    provider: 'Perplexity',
    contextLength: 32768,
    description: '具有在线搜索能力的小型模型'
  }
];

// xAI模型
export const xaiModels: ModelInfo[] = [
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xAI',
    contextLength: 8192,
    description: 'xAI的Grok模型测试版'
  }
];

// Mistral AI模型
export const mistralModels: ModelInfo[] = [
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    contextLength: 32768,
    description: 'Mistral AI最大的模型',
    pricing: { input: 0.008, output: 0.024 }
  },
  {
    id: 'mistral-medium-latest',
    name: 'Mistral Medium',
    provider: 'Mistral AI',
    contextLength: 32768,
    description: 'Mistral AI中等规模模型',
    pricing: { input: 0.0027, output: 0.0081 }
  }
];

// DeepSeek模型
export const deepseekModels: ModelInfo[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    contextLength: 32768,
    description: 'DeepSeek对话模型'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    contextLength: 16384,
    description: 'DeepSeek代码生成模型'
  }
];

// 01.AI模型
export const oneaiModels: ModelInfo[] = [
  {
    id: 'yi-34b-chat-0205',
    name: 'Yi-34B Chat',
    provider: '01.AI',
    contextLength: 4096,
    description: '零一万物Yi-34B对话模型'
  },
  {
    id: 'yi-34b-chat-200k',
    name: 'Yi-34B Chat 200K',
    provider: '01.AI',
    contextLength: 200000,
    description: '零一万物Yi-34B长上下文模型'
  }
];

// 腾讯混元模型
export const tencentModels: ModelInfo[] = [
  {
    id: 'hunyuan-lite',
    name: '混元Lite',
    provider: '腾讯',
    contextLength: 4096,
    description: '腾讯混元轻量版模型'
  },
  {
    id: 'hunyuan-standard',
    name: '混元Standard',
    provider: '腾讯',
    contextLength: 8192,
    description: '腾讯混元标准版模型'
  }
];

// 科大讯飞星火模型
export const iflytekModels: ModelInfo[] = [
  {
    id: 'spark-3.0',
    name: '星火3.0',
    provider: '科大讯飞',
    contextLength: 8192,
    description: '科大讯飞星火认知大模型3.0'
  },
  {
    id: 'spark-2.0',
    name: '星火2.0',
    provider: '科大讯飞',
    contextLength: 4096,
    description: '科大讯飞星火认知大模型2.0'
  }
];

// 商汤日日新模型
export const sensetimeModels: ModelInfo[] = [
  {
    id: 'sensechat-5',
    name: 'SenseChat-5',
    provider: '商汤',
    contextLength: 8192,
    description: '商汤日日新SenseChat-5模型'
  }
];

// 字节云雀模型
export const bytedanceModels: ModelInfo[] = [
  {
    id: 'yunque-pro',
    name: '云雀Pro',
    provider: '字节跳动',
    contextLength: 32768,
    description: '字节跳动云雀大模型专业版'
  }
];

// 零一万物模型
export const lingyiModels: ModelInfo[] = [
  {
    id: 'yi-medium',
    name: 'Yi Medium',
    provider: '零一万物',
    contextLength: 16384,
    description: '零一万物Yi中等规模模型'
  }
];

// 百川智能模型
export const baichuanModels: ModelInfo[] = [
  {
    id: 'baichuan2-53b',
    name: 'Baichuan2-53B',
    provider: '百川智能',
    contextLength: 4096,
    description: '百川智能Baichuan2-53B模型'
  }
];

// 昆仑万维模型
export const kunlunModels: ModelInfo[] = [
  {
    id: 'skywork-13b',
    name: 'SkyWork-13B',
    provider: '昆仑万维',
    contextLength: 8192,
    description: '昆仑万维天工SkyWork-13B模型'
  }
];

// 阿里云百炼模型
export const alibabaCloudModels: ModelInfo[] = [
  {
    id: 'qwen-max',
    name: '通义千问Max',
    provider: '阿里云',
    contextLength: 6000,
    description: '阿里云百炼通义千问Max模型'
  }
];

// 华为盘古模型
export const huaweiModels: ModelInfo[] = [
  {
    id: 'pangu-alpha',
    name: '盘古Alpha',
    provider: '华为',
    contextLength: 2048,
    description: '华为盘古Alpha大模型'
  }
];

// Ollama模型
export const ollamaModels: ModelInfo[] = [
  {
    id: 'llama3:8b',
    name: 'Llama 3 8B',
    provider: 'Ollama',
    contextLength: 8192,
    description: '本地部署的Llama 3 8B模型'
  },
  {
    id: 'llama3:70b',
    name: 'Llama 3 70B',
    provider: 'Ollama',
    contextLength: 8192,
    description: '本地部署的Llama 3 70B模型'
  },
  {
    id: 'mistral:7b',
    name: 'Mistral 7B',
    provider: 'Ollama',
    contextLength: 32768,
    description: '本地部署的Mistral 7B模型'
  }
];

// Meta模型
export const metaModels: ModelInfo[] = [
  {
    id: 'llama-3-8b-instruct',
    name: 'Llama 3 8B Instruct',
    provider: 'Meta',
    contextLength: 8192,
    description: 'Meta Llama 3 8B指令微调模型'
  },
  {
    id: 'llama-3-70b-instruct',
    name: 'Llama 3 70B Instruct',
    provider: 'Meta',
    contextLength: 8192,
    description: 'Meta Llama 3 70B指令微调模型'
  }
];

// Coze模型
export const cozeModels: ModelInfo[] = [
  {
    id: 'coze-chat',
    name: 'Coze Chat',
    provider: 'Coze',
    contextLength: 4096,
    description: 'Coze智能对话模型'
  },
  {
    id: 'coze-assistant',
    name: 'Coze Assistant',
    provider: 'Coze',
    contextLength: 8192,
    description: 'Coze智能助手模型'
  }
];

// GitHub Copilot模型
export const githubCopilotModels: ModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GitHub Copilot Chat',
    provider: 'GitHub Copilot',
    contextLength: 8192,
    description: 'GitHub Copilot聊天模型'
  },
  {
    id: 'copilot-code',
    name: 'Copilot Code',
    provider: 'GitHub Copilot',
    contextLength: 8192,
    description: 'GitHub Copilot代码生成模型'
  }
];

export const getAllModels = (): ModelInfo[] => {
  return [
    ...openaiModels,
    ...anthropicModels,
    ...googleModels,
    ...baiduModels,
    ...qwenModels,
    ...doubaoModels,
    ...moonshotModels,
    ...zhipuModels,
    ...minimaxModels,
    ...azureModels,
    ...cohereModels,
    ...replicateModels,
    ...togetherModels,
    ...fireworksModels,
    ...groqModels,
    ...perplexityModels,
    ...xaiModels,
    ...mistralModels,
    ...deepseekModels,
    ...oneaiModels,
    ...tencentModels,
    ...iflytekModels,
    ...sensetimeModels,
    ...bytedanceModels,
    ...lingyiModels,
    ...baichuanModels,
    ...kunlunModels,
    ...alibabaCloudModels,
    ...huaweiModels,
    ...ollamaModels,
    ...metaModels,
    ...cozeModels,
    ...githubCopilotModels
  ];
};

export const getModelsByProvider = (provider: string): ModelInfo[] => {
  return getAllModels().filter(model => model.provider.toLowerCase().includes(provider.toLowerCase()));
};

export const getModelById = (id: string): ModelInfo | undefined => {
  return getAllModels().find(model => model.id === id);
}; 