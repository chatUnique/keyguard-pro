import React from 'react';
import { AiProvider } from '@/types';
import {
  OpenAI,
  Claude,
  Anthropic,
  Gemini,
  Baidu,
  Qwen,
  Doubao,
  Moonshot,
  Zhipu,
  Minimax,
  Microsoft,
  Cohere,
  HuggingFace,
  Google,
  // 新增国际服务商图标
  Replicate,
  Together,
  Fireworks,
  Groq,
  Perplexity,
  Grok,
  Mistral,
  Stability,
  Runway,
  // 新增主流服务商图标
  Ollama,
  Meta,
  Coze,
  GithubCopilot,
  // 新增国内服务商图标
  DeepSeek,
  Yi,
  Tencent,
  Spark,
  SenseNova,
  Hunyuan,
  Baichuan,
  // 其他可用图标
  Cline,
  AlibabaCloud,
  Yuanbao,
  Volcengine,
  Midjourney
} from '@lobehub/icons';

interface ProviderIconProps {
  provider: AiProvider;
  size?: number;
  className?: string;
}

/**
 * 服务商品牌图标组件
 * 基于 LobeHub AI/LLM Model Icon Set 官方组件
 * https://lobehub.com/zh/icons
 */
export const ProviderIcon: React.FC<ProviderIconProps> = ({ 
  provider, 
  size = 20, 
  className = '' 
}) => {
  // 通用图标组件（作为后备方案）
  const GenericIcon = ({ children, color = "#666" }: { children: React.ReactNode; color?: string }) => (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`} style={{width: size, height: size}}>
      <div style={{ color }} className="w-3/4 h-3/4 flex items-center justify-center text-xs font-bold">
        {children}
      </div>
    </div>
  );

  switch (provider) {
    case AiProvider.OPENAI:
      return <OpenAI size={size} className={className} color="#000" />;

    case AiProvider.ANTHROPIC:
      return <Claude size={size} className={className} color="#D97757" />;

    case AiProvider.GOOGLE:
      return <Gemini size={size} className={className} color="#1C69FF" />;

    case AiProvider.BAIDU:
      return <Baidu size={size} className={className} color="#2932E1" />;

    case AiProvider.QWEN:
      return <Qwen size={size} className={className} color="#615CED" />;

    case AiProvider.DOUBAO:
      return <Doubao.Color size={size} className={className} color="#FFF" />;

    case AiProvider.MOONSHOT:
      return <Moonshot size={size} className={className} color="#16191E" />;

    case AiProvider.ZHIPU:
      return <Zhipu size={size} className={className} color="#3859FF" />;

    case AiProvider.MINIMAX:
      return <Minimax size={size} className={className} color="#F23F5D" />;

    case AiProvider.AZURE:
      return <Microsoft size={size} className={className} color="#00A4EF" />;

    case AiProvider.COHERE:
      return <Cohere size={size} className={className} color="#39594D" />;

    case AiProvider.HUGGINGFACE:
      return <HuggingFace.Color size={size} className={className} />;

    // 新增国际服务商
    case AiProvider.REPLICATE:
      return <Replicate size={size} className={className} color="#EA2805" />;

    case AiProvider.TOGETHER:
      return <Together size={size} className={className} color="#0F6FFF" />;

    case AiProvider.FIREWORKS:
      return <Fireworks size={size} className={className} color="#5019C5" />;

    case AiProvider.GROQ:
      return <Groq size={size} className={className} color="#F55036" />;

    case AiProvider.PERPLEXITY:
      return <Perplexity size={size} className={className} color="#22B8CD" />;

    case AiProvider.XAI:
      return <Grok size={size} className={className} color="#000" />;

    case AiProvider.MISTRAL:
      return <Mistral size={size} className={className} color="#FA520F" />;

    case AiProvider.STABILITY:
      return <Stability size={size} className={className} color="#330066" />;

    case AiProvider.RUNWAY:
      return <Runway size={size} className={className} color="#FFF" />;

    // 新增国内服务商
    case AiProvider.DEEPSEEK:
      return <DeepSeek size={size} className={className} color="#4D6BFE" />;

    case AiProvider.ONEAI:
      return <Yi size={size} className={className} color="#003425" />;

    case AiProvider.TENCENT:
      return <Hunyuan size={size} className={className} color="#0053E0" />;

    case AiProvider.IFLYTEK:
      return <Spark size={size} className={className} color="#0070F0" />;

    case AiProvider.SENSETIME:
      return <SenseNova size={size} className={className} color="#5B2AD8" />;

    case AiProvider.BYTEDANCE:
      return <Doubao.Color size={size} className={className} color="#FFF" />; // 字节云雀使用豆包图标

    case AiProvider.LINGYI:
      return <Yi size={size} className={className} color="#003425" />; 

    case AiProvider.BAICHUAN:
      return <Baichuan size={size} className={className} color="#FF6933" />;

    case AiProvider.KUNLUN:
      return <GenericIcon color="#7C3AED">昆</GenericIcon>; // 昆仑万维暂无专用图标

    case AiProvider.ALIBABA_CLOUD:
      return <AlibabaCloud size={size} className={className} color="#FF6A00" />;

    case AiProvider.HUAWEI:
      return <GenericIcon color="#FF0000">华</GenericIcon>; 
      
    case AiProvider.SILICONFLOW:
      return <GenericIcon color="#4F46E5">硅</GenericIcon>;
      
    case AiProvider.OLLAMA:
      return <Ollama size={size} className={className} color="#000" />;

    case AiProvider.META:
      return <Meta.Color size={size} className={className} color="#000" />;

    case AiProvider.COZE:
      return <Coze.Avatar size={size} className={className} />;

    case AiProvider.GITHUB_COPILOT:
      return <GithubCopilot size={size} className={className} color="#000" />;

    // 新增其他服务商
    case AiProvider.CLINE:
      return <Cline.Avatar size={size} className={className} />; 

    case AiProvider.HUNYUAN:
      return <Hunyuan size={size} className={className} color="#0053E0" />;

    case AiProvider.YUANBAO:
      return <Yuanbao.Color size={size} className={className} />; 

    case AiProvider.VOLCENGINE:
      return <Volcengine.Color size={size} className={className}/>;

    case AiProvider.MIDJOURNEY:
      return <Midjourney.Avatar size={size} className={className} />; 

    case AiProvider.CUSTOM:
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg ${className}`} style={{width: size, height: size}}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/4 h-3/4">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center bg-gray-400 text-white rounded-lg ${className}`} style={{width: size, height: size}}>
          <span className="text-xs font-bold">?</span>
        </div>
      );
  }
}; 