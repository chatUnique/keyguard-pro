import { NextResponse } from 'next/server';
import { supportedModels } from '@/config/models';

interface ValidationResult {
  valid: boolean;
  message: string;
  details?: {
    model: string;
    availableModels?: string[];
    organization?: string;
    rateLimit?: {
      limit: string;
      remaining: string;
      reset: string;
    };
    status?: string;
    error?: string;
    [key: string]: any;
  };
}

// OpenAI 格式的请求
async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        valid: false,
        message: 'OpenAI API Key 无效',
        details: {
          model: 'OpenAI',
          error: error.error?.message || '验证失败',
        },
      };
    }

    const data = await response.json();
    const rateLimit = {
      limit: response.headers.get('x-ratelimit-limit') || 'unknown',
      remaining: response.headers.get('x-ratelimit-remaining') || 'unknown',
      reset: response.headers.get('x-ratelimit-reset') || 'unknown',
    };

    return {
      valid: true,
      message: 'OpenAI API Key 有效',
      details: {
        model: 'OpenAI',
        availableModels: data.data.map((model: any) => model.id),
        organization: response.headers.get('openai-organization') || undefined,
        rateLimit,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: 'OpenAI API Key 验证失败',
      details: {
        model: 'OpenAI',
        error: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

// Anthropic 格式的请求
async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        valid: false,
        message: 'Anthropic API Key 无效',
        details: {
          model: 'Anthropic',
          error: error.error?.message || '验证失败',
        },
      };
    }

    return {
      valid: true,
      message: 'Anthropic API Key 有效',
      details: {
        model: 'Anthropic',
        availableModels: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        status: 'API Key 验证成功',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Anthropic API Key 验证失败',
      details: {
        model: 'Anthropic',
        error: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

// Google AI 格式的请求
async function validateGoogleKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        valid: false,
        message: 'Google AI API Key 无效',
        details: {
          model: 'Google AI',
          error: error.error?.message || '验证失败',
        },
      };
    }

    const data = await response.json();
    
    // 确保返回的数据格式正确
    if (!data.models || !Array.isArray(data.models)) {
      return {
        valid: true,
        message: 'Google AI API Key 有效',
        details: {
          model: 'Google AI',
          status: 'API Key 验证成功，但无法获取可用模型列表',
        },
      };
    }
    
    return {
      valid: true,
      message: 'Google AI API Key 有效',
      details: {
        model: 'Google AI',
        availableModels: data.models.map((model: any) => model.name.split('/').pop()),
        status: 'API Key 验证成功',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Google AI API Key 验证失败',
      details: {
        model: 'Google AI',
        error: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

// Azure OpenAI 格式的请求
async function validateAzureKey(apiKey: string): Promise<ValidationResult> {
  try {
    // Azure OpenAI需要额外的端点信息，这里我们只检查密钥格式
    // 实际使用时需要用户提供完整的端点URL
    if (!/^[A-Za-z0-9]{32,}$/.test(apiKey)) {
      return {
        valid: false,
        message: 'Azure OpenAI API Key 格式无效',
        details: {
          model: 'Azure OpenAI',
          error: 'API Key 格式不正确，应为至少32个字符的字母数字组合',
        },
      };
    }

    // 由于Azure OpenAI需要特定的端点，这里我们只做格式验证
    return {
      valid: true,
      message: 'Azure OpenAI API Key 格式有效',
      details: {
        model: 'Azure OpenAI',
        status: 'API Key 格式验证通过（注意：完整验证需要提供Azure端点URL）',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Azure OpenAI API Key 验证失败',
      details: {
        model: 'Azure OpenAI',
        error: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

// Cohere 格式的请求
async function validateCohereKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        valid: false,
        message: 'Cohere API Key 无效',
        details: {
          model: 'Cohere',
          error: error.error?.message || '验证失败',
        },
      };
    }

    const data = await response.json();
    return {
      valid: true,
      message: 'Cohere API Key 有效',
      details: {
        model: 'Cohere',
        availableModels: data.models.map((model: any) => model.name),
        status: 'API Key 验证成功',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Cohere API Key 验证失败',
      details: {
        model: 'Cohere',
        error: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

export async function POST(request: Request) {
  try {
    const { apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        valid: false,
        message: '请提供 API Key',
      });
    }

    if (!model) {
      return NextResponse.json({
        valid: false,
        message: '请选择要验证的模型',
      });
    }

    let result: ValidationResult;

    switch (model) {
      case 'OpenAI':
        result = await validateOpenAIKey(apiKey);
        break;
      case 'Anthropic':
        result = await validateAnthropicKey(apiKey);
        break;
      case 'Google AI':
        result = await validateGoogleKey(apiKey);
        break;
      case 'Azure OpenAI':
        result = await validateAzureKey(apiKey);
        break;
      case 'Cohere':
        result = await validateCohereKey(apiKey);
        break;
      default:
        return NextResponse.json({
          valid: false,
          message: '不支持的模型类型',
        });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      valid: false,
      message: '验证过程中出现错误',
      details: {
        error: error instanceof Error ? error.message : '未知错误',
      },
    });
  }
} 