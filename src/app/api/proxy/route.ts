import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      method = 'GET', 
      headers = {}, 
      data,
      timeout = 15000 
    } = body;

    // 验证URL是否为允许的AI API端点
    const allowedDomains = [
      'api.openai.com',
      'api.anthropic.com',
      'generativelanguage.googleapis.com',
      'aip.baidubce.com',
      'dashscope.aliyuncs.com',
      'ark.cn-beijing.volces.com',
      'api.moonshot.cn',
      'open.bigmodel.cn',
      'api.minimax.chat',
      'api.cohere.ai',
      'api.huggingface.co',
      'huggingface.co',
      'api.replicate.com',
      'api.together.xyz',
      'api.fireworks.ai',
      'api.groq.com',
      'api.perplexity.ai',
      'api.x.ai',
      'api.mistral.ai',
      'api.deepseek.com',
      'api.lingyi.ai',
      'api.baichuan-ai.com',
      'api.sensetime.com',
      'api.yunque.bytedance.com',
      'api.siliconflow.cn'
    ];

    const urlObj = new URL(url);
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { error: '不允许的API端点' },
        { status: 403 }
      );
    }

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 转发请求
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          // 添加一些常用的头部
          'User-Agent': 'KeyGuard-Pro/1.0',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 获取响应数据
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      // 获取响应头
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        ok: response.ok
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: '请求超时' },
          { status: 408 }
        );
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { 
        error: '代理请求失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 