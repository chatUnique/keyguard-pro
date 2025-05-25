/**
 * 代理请求工具 - 用于绕过网络限制访问AI API
 */

interface ProxyRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
  useProxy?: boolean; // 是否使用代理
}

interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  ok: boolean;
}

/**
 * 检测是否需要使用代理（考虑用户设置和地理位置）
 * @returns 是否需要使用代理
 */
export function shouldUseProxy(): boolean {
  // 首先检查用户的手动设置
  if (typeof window !== 'undefined') {
    const proxyConfig = localStorage.getItem('keyguard-proxy-config');
    if (proxyConfig) {
      try {
        const config = JSON.parse(proxyConfig);
        // 如果用户禁用了代理，强制直连
        if (!config.enabled) {
          return false;
        }
        // 如果用户强制启用代理
        if (config.forceProxy) {
          return true;
        }
        // 如果用户禁用了自动检测，使用直连
        if (!config.autoDetect) {
          return false;
        }
      } catch (e) {
        console.warn('Failed to parse proxy config:', e);
      }
    }
    
    // 自动检测：检测时区，如果是中国时区且在浏览器环境，建议使用代理
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const chineseTimezones = ['Asia/Shanghai', 'Asia/Beijing', 'Asia/Chongqing', 'Asia/Harbin'];
    return chineseTimezones.includes(timezone);
  }
  return false;
}

/**
 * 智能代理请求函数
 * 自动检测网络环境，决定是否使用代理
 * @param options - 请求选项
 * @returns 代理响应
 */
export async function smartFetch(options: ProxyRequestOptions): Promise<ProxyResponse> {
  const {
    url,
    method = 'GET',
    headers = {},
    data,
    timeout = 30000,
    useProxy = shouldUseProxy()
  } = options;

  if (useProxy && typeof window !== 'undefined') {
    // 使用代理服务器
    return proxyFetch(options);
  } else {
    // 直接请求
    return directFetch(options);
  }
}

/**
 * 通过代理服务器请求
 * @param options - 请求选项
 * @returns 代理响应
 */
export async function proxyFetch(options: ProxyRequestOptions): Promise<ProxyResponse> {
  const {
    url,
    method = 'GET',
    headers = {},
    data,
    timeout = 30000
  } = options;

  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      method,
      headers,
      data,
      timeout
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '代理请求失败');
  }

  return await response.json();
}

/**
 * 直接请求（无代理）
 * @param options - 请求选项
 * @returns 直接响应
 */
export async function directFetch(options: ProxyRequestOptions): Promise<ProxyResponse> {
  const {
    url,
    method = 'GET',
    headers = {},
    data,
    timeout = 30000
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      ok: response.ok
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    
    throw error;
  }
}

/**
 * 针对特定AI提供商的优化代理请求
 */
export class AIProxyClient {
  private useProxy: boolean;

  /**
   * 构造函数
   * @param forceProxy - 是否强制使用代理
   * @param networkStatus - 网络状态信息
   */
  constructor(forceProxy?: boolean, networkStatus?: { direct: boolean; proxy: boolean; recommended: 'direct' | 'proxy' }) {
    if (networkStatus) {
      // 根据网络检测结果决定连接方式
      if (networkStatus.direct && !networkStatus.proxy) {
        // 只有直连可用，使用直连
        this.useProxy = false;
      } else if (!networkStatus.direct && networkStatus.proxy) {
        // 只有代理可用，使用代理
        this.useProxy = true;
      } else if (networkStatus.direct && networkStatus.proxy) {
        // 两种都可用，使用推荐方式
        this.useProxy = networkStatus.recommended === 'proxy';
      } else {
        // 都不可用，尝试用户设置或默认
        this.useProxy = forceProxy ?? shouldUseProxy();
      }
    } else {
      this.useProxy = forceProxy ?? shouldUseProxy();
    }
  }

  /**
   * 从网络状态创建客户端
   * @param networkStatus - 网络状态信息
   * @returns AI代理客户端实例
   */
  static fromNetworkStatus(networkStatus: { direct: boolean; proxy: boolean; recommended: 'direct' | 'proxy' }): AIProxyClient {
    return new AIProxyClient(undefined, networkStatus);
  }

  /**
   * 发送请求
   * @param options - 请求选项
   * @returns 请求响应
   */
  async request(options: ProxyRequestOptions): Promise<ProxyResponse> {
    return smartFetch({
      ...options,
      useProxy: this.useProxy
    });
  }

  /**
   * OpenAI API请求
   * @param endpoint - API端点
   * @param apiKey - API密钥
   * @param data - 请求数据
   * @returns 请求响应
   */
  async openai(endpoint: string, apiKey: string, data?: any): Promise<ProxyResponse> {
    return this.request({
      url: `https://api.openai.com${endpoint}`,
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data,
    });
  }

  /**
   * Anthropic API请求
   * @param endpoint - API端点
   * @param apiKey - API密钥
   * @param data - 请求数据
   * @returns 请求响应
   */
  async anthropic(endpoint: string, apiKey: string, data?: any): Promise<ProxyResponse> {
    return this.request({
      url: `https://api.anthropic.com${endpoint}`,
      method: data ? 'POST' : 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      data,
    });
  }

  /**
   * Google API请求
   * @param endpoint - API端点
   * @param apiKey - API密钥
   * @param data - 请求数据
   * @returns 请求响应
   */
  async google(endpoint: string, apiKey: string, data?: any): Promise<ProxyResponse> {
    const url = endpoint.includes('?') 
      ? `${endpoint}&key=${apiKey}`
      : `${endpoint}?key=${apiKey}`;
      
    return this.request({
      url: `https://generativelanguage.googleapis.com${url}`,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    });
  }

  /**
   * 测试网络连接性
   * @param forceRefresh - 是否强制刷新
   * @returns 网络状态信息
   */
  async testConnectivity(forceRefresh: boolean = false): Promise<{
    direct: boolean;
    proxy: boolean;
    recommended: 'direct' | 'proxy';
  }> {
    // 检查缓存（5分钟内的结果直接返回），除非强制刷新
    const cacheKey = 'network-connectivity-cache';
    const cacheTimeout = 5 * 60 * 1000; // 5分钟
    
    if (!forceRefresh && typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { result, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTimeout) {
            return result;
          }
        } catch (e) {
          // 缓存损坏，忽略
        }
      }
    }

    // 使用更轻量的测试端点和更短的超时
    const testUrl = 'https://api.openai.com/v1/models';
    const testHeaders = {
      'Authorization': 'Bearer test',
      'Content-Type': 'application/json',
    };

    // 获取用户的代理设置
    let userConfig = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('keyguard-proxy-config');
      if (saved) {
        try {
          userConfig = JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse proxy config:', e);
        }
      }
    }

    let directOk = false;
    let proxyOk = false;

    // 根据用户设置决定测试策略
    if (userConfig && !userConfig.enabled) {
      // 用户禁用了代理，只测试直连
      try {
        const directResponse = await directFetch({
          url: testUrl,
          headers: testHeaders,
          timeout: 3000 // 缩短到3秒
        });
        directOk = directResponse.status === 401;
      } catch {
        directOk = false;
      }
      proxyOk = false; // 用户禁用了代理
    } else if (userConfig && userConfig.forceProxy) {
      // 用户强制使用代理，测试代理并设置状态
      try {
        const proxyResponse = await proxyFetch({
          url: testUrl,
          headers: testHeaders,
          timeout: 5000 // 缩短到5秒
        });
        proxyOk = proxyResponse.status === 401;
      } catch {
        proxyOk = false;
      }
      // 强制代理模式：不测试直连，但标记为不可用（因为用户选择不使用）
      directOk = false;
    } else {
      // 自动检测模式，并行测试两种连接
      const tests = await Promise.allSettled([
        // 直连测试
        directFetch({
          url: testUrl,
          headers: testHeaders,
          timeout: 3000 // 缩短到3秒
        }).then(response => ({ type: 'direct', response })),
        
        // 代理测试
        proxyFetch({
          url: testUrl,
          headers: testHeaders,
          timeout: 5000 // 缩短到5秒
        }).then(response => ({ type: 'proxy', response }))
      ]);

      // 处理测试结果
      tests.forEach(test => {
        if (test.status === 'fulfilled') {
          const { type, response } = test.value;
          if (type === 'direct' && response.status === 401) {
            directOk = true;
          } else if (type === 'proxy' && response.status === 401) {
            proxyOk = true;
          }
        }
      });
    }

    // 根据用户设置和测试结果决定推荐方式
    let recommended: 'direct' | 'proxy' = 'direct';
    if (userConfig && !userConfig.enabled) {
      recommended = 'direct';
    } else if (userConfig && userConfig.forceProxy) {
      recommended = 'proxy';
    } else {
      recommended = directOk ? 'direct' : (proxyOk ? 'proxy' : 'direct');
    }

    const result = {
      direct: directOk,
      proxy: proxyOk,
      recommended
    };

    // 缓存结果
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          result,
          timestamp: Date.now()
        }));
      } catch (e) {
        // 存储失败，忽略
      }
    }

    return result;
  }

  /**
   * 快速预检查
   * @returns 网络状态信息
   */
  private async quickPreCheck(): Promise<{ direct: boolean; proxy: boolean }> {
    // 使用HEAD请求，更轻量
    const quickTestUrl = 'https://api.openai.com/v1/models';
    const quickHeaders = {
      'Authorization': 'Bearer test'
    };

    let directOk = false;
    let proxyOk = false;

    const quickTests = await Promise.allSettled([
      // 快速直连测试 - 使用HEAD请求
      directFetch({
        url: quickTestUrl,
        method: 'HEAD',
        headers: quickHeaders,
        timeout: 2000 // 只用2秒
      }).then(response => ({ type: 'direct', response })),
      
      // 快速代理测试 - 使用HEAD请求
      proxyFetch({
        url: quickTestUrl,
        method: 'HEAD',
        headers: quickHeaders,
        timeout: 3000 // 只用3秒
      }).then(response => ({ type: 'proxy', response }))
    ]);

    quickTests.forEach(test => {
      if (test.status === 'fulfilled') {
        const { type, response } = test.value;
        // HEAD请求也会返回401，说明连通性正常
        if (type === 'direct' && response.status === 401) {
          directOk = true;
        } else if (type === 'proxy' && response.status === 401) {
          proxyOk = true;
        }
      }
    });

    return { direct: directOk, proxy: proxyOk };
  }
}

/**
 * 获取当前网络状态
 * @returns 网络状态信息
 */
export function getCurrentNetworkStatus() {
  if (typeof window !== 'undefined' && window.networkStatus) {
    return window.networkStatus;
  }
  return null;
}

/**
 * 创建智能代理客户端
 * @returns AI代理客户端实例
 */
export function createSmartProxyClient(): AIProxyClient {
  // 首先检查用户的强制代理设置
  if (typeof window !== 'undefined') {
    const proxyConfig = localStorage.getItem('keyguard-proxy-config');
    if (proxyConfig) {
      try {
        const config = JSON.parse(proxyConfig);
        
        // 如果用户强制启用代理，无论网络状态如何都使用代理
        if (config.forceProxy) {
          return new AIProxyClient(true);
        }
        
        // 如果用户禁用了代理，强制直连
        if (!config.enabled) {
          return new AIProxyClient(false);
        }
      } catch (e) {
        console.warn('Failed to parse proxy config:', e);
      }
    }
  }

  // 其他情况使用网络状态决定
  const networkStatus = getCurrentNetworkStatus();
  if (networkStatus) {
    return AIProxyClient.fromNetworkStatus(networkStatus);
  }
  return new AIProxyClient();
} 