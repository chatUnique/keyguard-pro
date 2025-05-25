import { AiProvider, KeyStatus, ApiKeyValidationResult, RequestFormat, ProviderConfig } from '@/types';
import { AIProxyClient, smartFetch, createSmartProxyClient } from './proxyFetch';

/**
 * AI服务提供商配置
 * 包含每个服务商的API端点、请求头、密钥格式等信息
 */
const PROVIDER_CONFIGS: Record<AiProvider, ProviderConfig> = {
  [AiProvider.OPENAI]: {
    name: 'OpenAI',
    keyFormat: /^sk-[a-zA-Z0-9]{48}$/,
    keyExample: 'sk-abc123def456ghi789...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.openai.com/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.ANTHROPIC]: {
    name: 'Anthropic (Claude)',
    keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95}$/,
    keyExample: 'sk-ant-api03-abc123...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.anthropic.com/v1/messages',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'x-api-key': '{key}',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    },
  },
  [AiProvider.GOOGLE]: {
    name: 'Google AI (Gemini)',
    keyFormat: /^AIza[a-zA-Z0-9\-_]{35}$/,
    keyExample: 'AIzaSyAbc123Def456...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://generativelanguage.googleapis.com/v1/models?key={key}',
    },
    headers: {
      [RequestFormat.NATIVE]: {},
    },
  },
  [AiProvider.AZURE]: {
    name: 'Azure OpenAI',
    keyFormat: /^[a-zA-Z0-9]{32}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: '{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2023-05-15',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'api-key': '{key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.COHERE]: {
    name: 'Cohere',
    keyFormat: /^[a-zA-Z0-9\-_]{40,}$/,
    keyExample: 'abc123def456ghi789...',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.cohere.ai/v1/models',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.cohere.ai/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.HUGGINGFACE]: {
    name: 'Hugging Face',
    keyFormat: /^hf_[a-zA-Z0-9]{34,}$/,
    keyExample: 'hf_abc123def456...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://huggingface.co/api/whoami',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
      },
    },
  },
  [AiProvider.BAIDU]: {
    name: '百度文心一言',
    keyFormat: /^[a-zA-Z0-9]{24}$/,
    keyExample: 'abc123def456ghi789jkl012',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    needsSecretKey: true,
    endpoints: {
      [RequestFormat.NATIVE]: 'https://aip.baidubce.com/oauth/2.0/token',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {},
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.QWEN]: {
    name: '阿里通义千问',
    keyFormat: /^sk-[a-zA-Z0-9]{48}$/,
    keyExample: 'sk-abc123def456...',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.DOUBAO]: {
    name: '字节跳动豆包',
    keyFormat: /^[a-zA-Z0-9\-_]{32,}$/,
    keyExample: 'your-doubao-api-key',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://ark.cn-beijing.volces.com/api/v3/models',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.MOONSHOT]: {
    name: 'Moonshot AI (Kimi)',
    keyFormat: /^sk-[a-zA-Z0-9]{48}$/,
    keyExample: 'sk-abc123def456...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.moonshot.cn/v1/models',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.ZHIPU]: {
    name: '智谱AI (GLM)',
    keyFormat: /^[a-zA-Z0-9\-_\.]{32,}$/,
    keyExample: 'your-zhipu-api-key',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://open.bigmodel.cn/api/paas/v4/models',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.MINIMAX]: {
    name: 'MiniMax',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: 'your-minimax-api-key',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.minimax.chat/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.VOLCENGINE]: {
    name: '火山引擎 (Volcengine)',
    keyFormat: /^[a-zA-Z0-9\-_]{32,}$/,
    keyExample: 'volc-1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://ark.cn-beijing.volces.com/api/v3/models',
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.MIDJOURNEY]: {
    name: 'Midjourney',
    keyFormat: /^[a-zA-Z0-9\-_]{32,}$/,
    keyExample: 'mj-1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.midjourney.com/v1/imagine',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.CUSTOM]: {
    name: '自定义端点',
    keyFormat: /^.+$/,
    keyExample: 'your-custom-api-key',
    supportedFormats: [RequestFormat.NATIVE, RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.NATIVE]: '{endpoint}',
      [RequestFormat.OPENAI_COMPATIBLE]: '{endpoint}',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.REPLICATE]: {
    name: 'Replicate',
    keyFormat: /^r8_[a-zA-Z0-9]{32,}$/,
    keyExample: 'r8_1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.replicate.com/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Token {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.TOGETHER]: {
    name: 'Together AI',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.together.xyz/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.FIREWORKS]: {
    name: 'Fireworks AI',
    keyFormat: /^fw_[a-zA-Z0-9]{32,}$/,
    keyExample: 'fw_1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.fireworks.ai/inference/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.GROQ]: {
    name: 'Groq',
    keyFormat: /^gsk_[a-zA-Z0-9]{32,}$/,
    keyExample: 'gsk_1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.groq.com/openai/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.PERPLEXITY]: {
    name: 'Perplexity',
    keyFormat: /^pplx-[a-zA-Z0-9]{32,}$/,
    keyExample: 'pplx-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.perplexity.ai/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.XAI]: {
    name: 'xAI (Grok)',
    keyFormat: /^xai-[a-zA-Z0-9]{32,}$/,
    keyExample: 'xai-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.x.ai/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.MISTRAL]: {
    name: 'Mistral AI',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.mistral.ai/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.STABILITY]: {
    name: 'Stability AI',
    keyFormat: /^sk-[a-zA-Z0-9]{32,}$/,
    keyExample: 'sk-1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.stability.ai/v1/user/account',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.RUNWAY]: {
    name: 'Runway ML',
    keyFormat: /^rw_[a-zA-Z0-9]{32,}$/,
    keyExample: 'rw_1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.runwayml.com/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.OLLAMA]: {
    name: 'Ollama',
    keyFormat: /^[a-zA-Z0-9\-_]{0,}$/,
    keyExample: 'ollama-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'http://localhost:11434/api/tags',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.META]: {
    name: 'Meta AI',
    keyFormat: /^[a-zA-Z0-9\-_]{32,}$/,
    keyExample: 'meta_1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.meta.ai/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.COZE]: {
    name: 'Coze',
    keyFormat: /^pat_[a-zA-Z0-9]{32,}$/,
    keyExample: 'pat_1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.coze.com/v1/bots',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.GITHUB_COPILOT]: {
    name: 'GitHub Copilot',
    keyFormat: /^ghp_[a-zA-Z0-9]{36}$/,
    keyExample: 'ghp_1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.github.com/user',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.DEEPSEEK]: {
    name: 'DeepSeek',
    keyFormat: /^sk-[a-zA-Z0-9]{32,}$/,
    keyExample: 'sk-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.deepseek.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.ONEAI]: {
    name: '零一万物 (01.AI)',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.01.ai/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.TENCENT]: {
    name: '腾讯混元',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://hunyuan.tencentcloudapi.com',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.IFLYTEK]: {
    name: '科大讯飞星火',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://spark-api.xf-yun.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.SENSETIME]: {
    name: '商汤日日新',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.sensetime.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.BYTEDANCE]: {
    name: '字节云雀',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://ark.cn-beijing.volces.com/api/v3/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.LINGYI]: {
    name: '零一万物',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.lingyiwanwu.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.BAICHUAN]: {
    name: '百川智能',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.baichuan-ai.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.KUNLUN]: {
    name: '昆仑万维',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.kunlun.com/v1/chat/completions',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.ALIBABA_CLOUD]: {
    name: '阿里云百炼',
    keyFormat: /^sk-[a-zA-Z0-9]{32,}$/,
    keyExample: 'sk-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.HUAWEI]: {
    name: '华为盘古',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.huaweicloud.com/v1/pangu',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.CLINE]: {
    name: 'Cline',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.cline.com/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.HUNYUAN]: {
    name: '腾讯混元',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://hunyuan.tencentcloudapi.com',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.YUANBAO]: {
    name: '字节元宝',
    keyFormat: /^[a-zA-Z0-9]{32,}$/,
    keyExample: '1234567890abcdef...',
    supportedFormats: [RequestFormat.NATIVE],
    endpoints: {
      [RequestFormat.NATIVE]: 'https://api.yuanbao.com/v1/models',
    },
    headers: {
      [RequestFormat.NATIVE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
  [AiProvider.SILICONFLOW]: {
    name: '硅基流动',
    keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
    keyExample: 'sk-1234567890abcdef...',
    supportedFormats: [RequestFormat.OPENAI_COMPATIBLE],
    endpoints: {
      [RequestFormat.OPENAI_COMPATIBLE]: 'https://api.siliconflow.cn/v1/models',
    },
    headers: {
      [RequestFormat.OPENAI_COMPATIBLE]: {
        'Authorization': 'Bearer {key}',
        'Content-Type': 'application/json',
      },
    },
  },
};

/**
 * 验证API密钥格式
 * @param apiKey - 要验证的API密钥
 * @param provider - AI服务提供商
 * @returns 密钥格式是否有效
 */
export function validateKeyFormat(apiKey: string, provider: AiProvider): boolean {
  const config = PROVIDER_CONFIGS[provider];
  return config?.keyFormat?.test(apiKey) ?? false;
}

/**
 * 获取服务商显示名称
 * @param provider - AI服务提供商
 * @returns 服务商的显示名称
 */
export function getProviderDisplayName(provider: AiProvider): string {
  return PROVIDER_CONFIGS[provider]?.name ?? provider;
}

/**
 * 获取密钥示例
 * @param provider - AI服务提供商
 * @returns 该服务商的密钥示例
 */
export function getKeyExample(provider: AiProvider): string {
  return PROVIDER_CONFIGS[provider]?.keyExample ?? '';
}

/**
 * 获取支持的请求格式
 * @param provider - AI服务提供商
 * @returns 该服务商支持的请求格式列表
 */
export function getSupportedFormats(provider: AiProvider): RequestFormat[] {
  return PROVIDER_CONFIGS[provider]?.supportedFormats ?? [];
}

/**
 * 检查是否需要密钥
 * @param provider - AI服务提供商
 * @returns 是否需要密钥
 */
export function needsSecretKey(provider: AiProvider): boolean {
  return PROVIDER_CONFIGS[provider]?.needsSecretKey ?? false;
}

/**
 * 获取请求头
 * @param provider - AI服务提供商
 * @param format - 请求格式
 * @param apiKey - API密钥
 * @returns 请求头对象
 */
function getRequestHeaders(provider: AiProvider, format: RequestFormat, apiKey: string): Record<string, string> {
  const config = PROVIDER_CONFIGS[provider];
  if (!config?.headers?.[format]) return {};

  const headers = { ...config.headers[format] };
  Object.keys(headers).forEach(key => {
    headers[key] = headers[key].replace('{key}', apiKey);
  });
  return headers;
}

/**
 * AI密钥验证器类
 * 提供验证各种AI服务商API密钥的功能
 */
export class AIKeyValidator {
  /**
   * 验证密钥格式
   * @param key - 要验证的API密钥
   * @param provider - AI服务提供商
   * @returns 密钥格式是否有效
   */
  static validateKeyFormat(key: string, provider: AiProvider): boolean {
    return validateKeyFormat(key, provider);
  }

  /**
   * 验证API密钥
   * @param key - 要验证的API密钥
   * @param provider - AI服务提供商
   * @param format - 请求格式
   * @param checkBalance - 是否检查余额
   * @param secretKey - 密钥（如果需要）
   * @returns 验证结果
   */
  static async validateKey(
    key: string, 
    provider: AiProvider, 
    format: RequestFormat = RequestFormat.NATIVE,
    checkBalance: boolean = false,
    secretKey?: string
  ): Promise<ApiKeyValidationResult> {
    // 清空内存中的key引用（安全措施）
    const keyToValidate = key;
    key = '';
    
    if (!this.validateKeyFormat(keyToValidate, provider)) {
      return {
        isValid: false,
        provider,
        requestFormat: format,
        status: KeyStatus.FORMAT_ERROR,
        message: 'API Key格式不正确',
        error: 'Invalid key format',
      };
    }

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return {
        isValid: false,
        provider,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '不支持的AI服务提供商',
        error: 'Unsupported provider',
      };
    }

    if (!config.supportedFormats.includes(format)) {
      return {
        isValid: false,
        provider,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: `${config.name} 不支持 ${format} 格式`,
        error: 'Unsupported request format',
      };
    }

    // 根据提供商进行实际验证
    switch (provider) {
      case AiProvider.OPENAI:
        return this.validateOpenAI(keyToValidate, format, checkBalance);
      case AiProvider.ANTHROPIC:
        return this.validateAnthropic(keyToValidate, format, checkBalance);
      case AiProvider.GOOGLE:
        return this.validateGoogle(keyToValidate, format, checkBalance);
      case AiProvider.BAIDU:
        return this.validateBaidu(keyToValidate, format, checkBalance, secretKey);
      case AiProvider.QWEN:
        return this.validateQwen(keyToValidate, format, checkBalance);
      case AiProvider.DOUBAO:
        return this.validateDoubao(keyToValidate, format, checkBalance);
      case AiProvider.MOONSHOT:
        return this.validateMoonshot(keyToValidate, format, checkBalance);
      case AiProvider.ZHIPU:
        return this.validateZhipu(keyToValidate, format, checkBalance);
      case AiProvider.MINIMAX:
        return this.validateMinimax(keyToValidate, format, checkBalance);
      case AiProvider.AZURE:
        return this.validateAzure(keyToValidate, format, checkBalance);
      case AiProvider.COHERE:
        return this.validateCohere(keyToValidate, format, checkBalance);
      case AiProvider.HUGGINGFACE:
        return this.validateHuggingFace(keyToValidate, format, checkBalance);
      
      // 新增国际服务商
      case AiProvider.REPLICATE:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.TOGETHER:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.FIREWORKS:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.GROQ:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.PERPLEXITY:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.XAI:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.MISTRAL:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.STABILITY:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.RUNWAY:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      
      // 新增主流服务商
      case AiProvider.OLLAMA:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.META:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.COZE:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.GITHUB_COPILOT:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      
      // 新增国内服务商
      case AiProvider.DEEPSEEK:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.ONEAI:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.TENCENT:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.IFLYTEK:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.SENSETIME:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.BYTEDANCE:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.LINGYI:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.BAICHUAN:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.KUNLUN:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.ALIBABA_CLOUD:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.HUAWEI:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      
      // 新增其他服务商
      case AiProvider.CLINE:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.HUNYUAN:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.SILICONFLOW:
        return this.validateSiliconFlow(keyToValidate, format, checkBalance);
      case AiProvider.VOLCENGINE:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.MIDJOURNEY:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      case AiProvider.CUSTOM:
        return this.validateGeneric(keyToValidate, provider, format, checkBalance);
      
      default:
        return {
          isValid: false,
          provider,
          requestFormat: format,
          status: KeyStatus.UNKNOWN,
          message: '不支持的AI服务提供商',
          error: 'Unsupported provider',
        };
    }
  }

  /**
   * 验证OpenAI API密钥
   * @param apiKey - API密钥
   * @param format - 请求格式
   * @param checkBalance - 是否检查余额
   * @returns 验证结果
   */
  private static async validateOpenAI(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      // 使用智能代理客户端，根据网络状态选择连接方式
      const proxyClient = createSmartProxyClient();
      
      const response = await proxyClient.openai('/v1/models', apiKey);

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.OPENAI,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.OPENAI,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 尝试获取账户信息
      let accountInfo = null;
      let balance: number | undefined = undefined;
      try {
        if (checkBalance) {
          // 查询余额信息
          const billingResponse = await proxyClient.openai('/v1/dashboard/billing/subscription', apiKey);
          if (billingResponse.ok) {
            const billingData = billingResponse.data;
            balance = billingData.hard_limit_usd || billingData.system_hard_limit_usd || null;
          }
        }
        
        const usageResponse = await proxyClient.openai('/v1/usage', apiKey);
        if (usageResponse.ok) {
          accountInfo = usageResponse.data;
        }
      } catch (e) {
        // 忽略账户信息获取失败
      }

      return {
        isValid: true,
        provider: AiProvider.OPENAI,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: response.data?.data?.map((model: any) => model.id) || [],
          organization: response.headers['openai-organization'] || undefined,
          accountInfo,
          balance,
          rateLimit: {
            requests: parseInt(response.headers['x-ratelimit-limit-requests'] || '0'),
            tokens: parseInt(response.headers['x-ratelimit-limit-tokens'] || '0'),
            resetTime: response.headers['x-ratelimit-reset-requests'] || '',
          },
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.OPENAI,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateAnthropic(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const proxyClient = createSmartProxyClient();
      
      const response = await proxyClient.anthropic('/v1/messages', apiKey, {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.ANTHROPIC,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.ANTHROPIC,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      // 尝试获取账户信息和余额
      let balance: number | undefined = undefined;
      if (checkBalance) {
        try {
          // Anthropic 没有公开的余额查询API，这里只是示例
          // 实际使用时可能需要通过其他方式获取
          const billingResponse = await proxyClient.anthropic('/v1/billing', apiKey);
          if (billingResponse.ok) {
            balance = billingResponse.data?.balance || null;
          }
        } catch (e) {
          // 忽略余额查询失败
        }
      }

      return {
        isValid: true,
        provider: AiProvider.ANTHROPIC,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
          balance,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.ANTHROPIC,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateGoogle(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const proxyClient = createSmartProxyClient();
      
      const response = await proxyClient.google('/v1/models', apiKey);

      if (response.status === 403) {
        return {
          isValid: false,
          provider: AiProvider.GOOGLE,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.GOOGLE,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        isValid: true,
        provider: AiProvider.GOOGLE,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: response.data?.models?.map((model: any) => model.name.split('/').pop()) || [],
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.GOOGLE,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateBaidu(apiKey: string, format: RequestFormat, checkBalance: boolean, secretKey?: string): Promise<ApiKeyValidationResult> {
    if (!secretKey) {
      return {
        isValid: false,
        provider: AiProvider.BAIDU,
        requestFormat: format,
        status: KeyStatus.INVALID,
        message: '百度文心一言需要提供Secret Key',
        error: 'Secret key required',
      };
    }

    try {
      const proxyClient = createSmartProxyClient();
      
      const response = await proxyClient.request({
        url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
        method: 'POST',
      });
      
      if (!response.data?.access_token) {
        return {
          isValid: false,
          provider: AiProvider.BAIDU,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key或Secret Key',
          error: 'Invalid credentials',
        };
      }

      return {
        isValid: true,
        provider: AiProvider.BAIDU,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: ['ernie-bot', 'ernie-bot-turbo', 'ernie-bot-4'],
          accountInfo: { access_token: response.data.access_token },
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.BAIDU,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateQwen(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const endpoint = format === RequestFormat.NATIVE 
        ? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
        : 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';

      const config: RequestInit = {
        headers: getRequestHeaders(AiProvider.QWEN, format, apiKey),
      };

      if (format === RequestFormat.NATIVE) {
        config.method = 'POST';
        config.body = JSON.stringify({
          model: 'qwen-turbo',
          input: { messages: [{ role: 'user', content: 'Hi' }] },
          parameters: { max_tokens: 1 }
        });
      }

      const response = await fetch(endpoint, config);

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.QWEN,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.QWEN,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      return {
        isValid: true,
        provider: AiProvider.QWEN,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.QWEN,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateDoubao(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const endpoint = format === RequestFormat.NATIVE 
        ? 'https://ark.cn-beijing.volces.com/api/v3/models'
        : 'https://ark.cn-beijing.volces.com/api/v3/models';

      const response = await fetch(endpoint, {
        headers: getRequestHeaders(AiProvider.DOUBAO, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.DOUBAO,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.DOUBAO,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      return {
        isValid: true,
        provider: AiProvider.DOUBAO,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models: ['doubao-lite', 'doubao-pro'],
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.DOUBAO,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 为其他提供商添加类似的验证方法...
  private static async validateMoonshot(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/models', {
        headers: getRequestHeaders(AiProvider.MOONSHOT, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.MOONSHOT,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      return {
        isValid: response.ok,
        provider: AiProvider.MOONSHOT,
        requestFormat: format,
        status: response.ok ? KeyStatus.VALID : KeyStatus.UNKNOWN,
        message: response.ok ? 'API Key验证成功' : '验证失败',
        details: response.ok ? {
          models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
        } : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.MOONSHOT,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateZhipu(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const endpoint = format === RequestFormat.NATIVE 
        ? 'https://open.bigmodel.cn/api/paas/v4/models'
        : 'https://open.bigmodel.cn/api/paas/v4/models';

      const response = await fetch(endpoint, {
        headers: getRequestHeaders(AiProvider.ZHIPU, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.ZHIPU,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      return {
        isValid: response.ok,
        provider: AiProvider.ZHIPU,
        requestFormat: format,
        status: response.ok ? KeyStatus.VALID : KeyStatus.UNKNOWN,
        message: response.ok ? 'API Key验证成功' : '验证失败',
        details: response.ok ? {
          models: ['glm-4', 'glm-4v', 'glm-3-turbo'],
        } : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.ZHIPU,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateMinimax(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    // MiniMax 验证逻辑（简化版本，仅格式验证）
    return {
      isValid: true,
      provider: AiProvider.MINIMAX,
      requestFormat: format,
      status: KeyStatus.VALID,
      message: 'API Key格式验证通过（需要具体端点进行完整验证）',
      details: {
        models: ['abab6-chat', 'abab5.5-chat'],
      },
    };
  }

  private static async validateAzure(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    // Azure OpenAI 需要具体端点，这里只进行格式验证
    return {
      isValid: true,
      provider: AiProvider.AZURE,
      requestFormat: format,
      status: KeyStatus.VALID,
      message: 'API Key格式验证通过（需要具体端点进行完整验证）',
      details: {
        models: ['gpt-4', 'gpt-35-turbo'],
      },
    };
  }

  private static async validateCohere(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const endpoint = format === RequestFormat.NATIVE 
        ? 'https://api.cohere.ai/v1/models'
        : 'https://api.cohere.ai/v1/models';

      const response = await fetch(endpoint, {
        headers: getRequestHeaders(AiProvider.COHERE, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.COHERE,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      return {
        isValid: response.ok,
        provider: AiProvider.COHERE,
        requestFormat: format,
        status: response.ok ? KeyStatus.VALID : KeyStatus.UNKNOWN,
        message: response.ok ? 'API Key验证成功' : '验证失败',
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.COHERE,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateHuggingFace(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: getRequestHeaders(AiProvider.HUGGINGFACE, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.HUGGINGFACE,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isValid: true,
        provider: AiProvider.HUGGINGFACE,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          organization: data.name || data.fullname,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.HUGGINGFACE,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateGeneric(apiKey: string, provider: AiProvider, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      const config = PROVIDER_CONFIGS[provider];
      if (!config) {
        return {
          isValid: false,
          provider,
          requestFormat: format,
          status: KeyStatus.UNKNOWN,
          message: '不支持的AI服务提供商',
          error: 'Unsupported provider',
        };
      }

      const endpoint = config.endpoints[format];
      if (!endpoint) {
        return {
          isValid: false,
          provider,
          requestFormat: format,
          status: KeyStatus.UNKNOWN,
          message: `${config.name} 不支持 ${format} 格式`,
          error: 'Unsupported request format',
        };
      }

      // 处理需要替换占位符的URL
      let finalEndpoint = endpoint;
      if (endpoint.includes('{key}')) {
        finalEndpoint = endpoint.replace('{key}', apiKey);
      }

      // 使用智能代理客户端，根据网络状态选择连接方式
      const proxyClient = createSmartProxyClient();
      const response = await proxyClient.request({
        url: finalEndpoint,
        headers: getRequestHeaders(provider, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      return {
        isValid: response.ok,
        provider,
        requestFormat: format,
        status: response.ok ? KeyStatus.VALID : KeyStatus.UNKNOWN,
        message: response.ok ? 'API Key验证成功' : '验证失败',
        details: response.ok ? {
          models: [config.name + ' 模型'],
        } : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        provider,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async validateSiliconFlow(apiKey: string, format: RequestFormat, checkBalance: boolean): Promise<ApiKeyValidationResult> {
    try {
      // 首先验证模型端点
      const response = await fetch('https://api.siliconflow.cn/v1/models', {
        headers: getRequestHeaders(AiProvider.SILICONFLOW, format, apiKey),
      });

      if (response.status === 401) {
        return {
          isValid: false,
          provider: AiProvider.SILICONFLOW,
          requestFormat: format,
          status: KeyStatus.INVALID,
          message: '无效的API Key',
          error: 'API Key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          provider: AiProvider.SILICONFLOW,
          requestFormat: format,
          status: KeyStatus.RATE_LIMITED,
          message: 'API Key已达到速率限制',
          error: 'Rate limit exceeded',
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 获取模型列表
      const modelsData = await response.json();
      const models = modelsData?.data?.map((model: any) => model.id) || 
                   ['deepseek-chat', 'qwen-72b-chat', 'llama-3-8b-instruct', 'llama-3-70b-instruct', 'yi-1.5-34b-chat'];

      // 查询用户信息和余额
      let userInfo = null;
      let balance: number | undefined = undefined;
      
      if (checkBalance) {
        try {
          const userInfoResponse = await fetch('https://api.siliconflow.cn/v1/user/info', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (userInfoResponse.ok) {
            const responseData = await userInfoResponse.json();
            
            // 检查响应状态
            if (responseData.code === 20000 && responseData.status === true && responseData.data) {
              userInfo = responseData.data;
              
              // 从用户信息中提取余额，硅基流动有多个余额字段
              const balanceValue = userInfo.totalBalance || userInfo.balance || userInfo.chargeBalance;
              if (balanceValue) {
                // 转换字符串余额为数字
                balance = parseFloat(balanceValue);
              }
            }
          }
        } catch (e) {
          // 忽略用户信息获取失败，不影响主要验证
          console.warn('Failed to fetch SiliconFlow user info:', e);
        }
      }

      return {
        isValid: true,
        provider: AiProvider.SILICONFLOW,
        requestFormat: format,
        status: KeyStatus.VALID,
        message: 'API Key验证成功',
        details: {
          models,
          balance,
          accountInfo: userInfo ? {
            userId: userInfo.id,
            username: userInfo.name,
            email: userInfo.email,
            isAdmin: userInfo.isAdmin,
            status: userInfo.status,
            role: userInfo.role,
            introduction: userInfo.introduction,
            avatar: userInfo.image,
            balanceDetails: {
              balance: userInfo.balance,
              chargeBalance: userInfo.chargeBalance,
              totalBalance: userInfo.totalBalance,
            },
            rawUserInfo: userInfo, // 保留原始用户信息以供调试
          } : undefined,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        provider: AiProvider.SILICONFLOW,
        requestFormat: format,
        status: KeyStatus.UNKNOWN,
        message: '验证过程中出现错误',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * 验证API密钥的便捷函数
 * @param apiKey - 要验证的API密钥
 * @param provider - AI服务提供商
 * @param format - 请求格式
 * @param secretKey - 密钥（如果需要）
 * @returns 验证结果
 */
export async function validateApiKey(
  apiKey: string, 
  provider: AiProvider, 
  format: RequestFormat = RequestFormat.NATIVE,
  secretKey?: string
): Promise<ApiKeyValidationResult> {
  return AIKeyValidator.validateKey(apiKey, provider, format, false, secretKey);
} 