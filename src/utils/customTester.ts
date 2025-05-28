import { 
  CustomRequest, 
  CustomResponse, 
  Template, 
  HttpMethod, 
  TemplateCategory 
} from '@/types';

/**
 * 自定义URL测试器类
 * 提供自定义API请求测试和模板管理功能
 */
export class CustomTester {
  private static readonly STORAGE_KEY = 'ai-key-checker-templates';

  /**
   * 执行自定义请求
   * @param request - 自定义请求配置
   * @returns 请求响应结果
   */
  static async executeRequest(request: CustomRequest): Promise<CustomResponse> {
    const startTime = Date.now();
    
    try {
      // 替换URL中的变量
      const processedUrl = this.replaceVariables(request.url, request.variables);
      
      // 处理请求头
      const processedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(request.headers)) {
        processedHeaders[key] = this.replaceVariables(value, request.variables);
      }

      // 处理请求体
      let processedBody: string | undefined;
      if (request.body && request.method !== HttpMethod.GET) {
        processedBody = this.replaceVariables(request.body, request.variables);
      }

      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), request.timeout);

      // 执行请求
      const response = await fetch(processedUrl, {
        method: request.method,
        headers: processedHeaders,
        body: processedBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // 处理响应
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody: any;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType?.includes('application/json')) {
          responseBody = await response.json();
        } else {
          responseBody = await response.text();
        }
      } catch (error) {
        responseBody = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        responseTime: endTime - startTime,
      };

    } catch (error) {
      const endTime = Date.now();
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 0,
          statusText: 'Request Timeout',
          headers: {},
          body: null,
          responseTime: endTime - startTime,
          error: `请求超时 (${request.timeout}ms)`,
        };
      }

      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: null,
        responseTime: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 替换字符串中的变量
   * 支持格式：{VARIABLE_NAME}
   * @param template - 包含变量的模板字符串
   * @param variables - 变量映射对象
   * @returns 替换变量后的字符串
   */
  static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;

    // 添加内置变量
    const builtInVariables = {
      TIMESTAMP: Date.now().toString(),
      ISO_DATE: new Date().toISOString(),
      UNIX_TIME: Math.floor(Date.now() / 1000).toString(),
      RANDOM: Math.random().toString(36).substring(2),
      UUID: crypto.randomUUID ? crypto.randomUUID() : this.generateUUID(),
      ...variables,
    };

    // 替换变量
    for (const [key, value] of Object.entries(builtInVariables)) {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(pattern, value);
    }

    return result;
  }

  /**
   * 生成UUID (备用方法)
   * @returns 生成的UUID字符串
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 保存模板到LocalStorage
   * @param template - 要保存的模板
   * @returns 保存后的完整模板对象
   */
  static saveTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    const templates = this.getTemplates();
    
    const newTemplate: Template = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    templates.push(newTemplate);
    this.saveTemplatesToStorage(templates);
    
    return newTemplate;
  }

  /**
   * 更新模板
   * @param id - 模板ID
   * @param updates - 要更新的字段
   * @returns 更新后的模板对象，如果模板不存在则返回null
   */
  static updateTemplate(id: string, updates: Partial<Template>): Template | null {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveTemplatesToStorage(templates);
    return templates[index];
  }

  /**
   * 删除模板
   * @param id - 要删除的模板ID
   * @returns 是否成功删除
   */
  static deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) {
      return false; // 模板不存在
    }

    this.saveTemplatesToStorage(filteredTemplates);
    return true;
  }

  /**
   * 获取所有模板
   * @returns 模板列表
   */
  static getTemplates(): Template[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.getDefaultTemplates();
      
      const templates = JSON.parse(stored);
      
      // 确保默认模板始终存在
      const defaultTemplates = this.getDefaultTemplates();
      const existingIds = new Set(templates.map((t: Template) => t.id));
      
      for (const defaultTemplate of defaultTemplates) {
        if (!existingIds.has(defaultTemplate.id)) {
          templates.push(defaultTemplate);
        }
      }
      
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * 按类别获取模板
   * @param category - 模板类别
   * @returns 指定类别的模板列表
   */
  static getTemplatesByCategory(category: TemplateCategory): Template[] {
    return this.getTemplates().filter(template => template.category === category);
  }

  /**
   * 获取指定模板
   * @param id - 模板ID
   * @returns 模板对象，如果不存在则返回null
   */
  static getTemplate(id: string): Template | null {
    const templates = this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }

  /**
   * 导入模板
   * @param importedTemplates - 要导入的模板列表
   */
  static importTemplates(importedTemplates: Template[]): void {
    const existingTemplates = this.getTemplates();
    const existingIds = new Set(existingTemplates.map(t => t.id));
    
    const newTemplates = importedTemplates.filter(template => !existingIds.has(template.id));
    const allTemplates = [...existingTemplates, ...newTemplates];
    
    this.saveTemplatesToStorage(allTemplates);
  }

  /**
   * 导出模板
   * @returns 所有模板列表
   */
  static exportTemplates(): Template[] {
    return this.getTemplates().filter(template => !template.id.startsWith('default-'));
  }

  /**
   * 保存模板到存储
   * @param templates - 要保存的模板列表
   */
  private static saveTemplatesToStorage(templates: Template[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  /**
   * 获取默认模板
   * @returns 默认模板列表
   */
  private static getDefaultTemplates(): Template[] {
    const now = new Date();
    
    return [
      {
        id: 'default-openai-models',
        name: 'OpenAI - 获取模型列表',
        description: '验证OpenAI API Key并获取可用模型',
        category: TemplateCategory.OPENAI,
        request: {
          url: 'https://api.openai.com/v1/models',
          method: HttpMethod.GET,
          headers: {
            'Authorization': 'Bearer {{API_KEY}}',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
          variables: {
            API_KEY: '',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'default-openai-chat',
        name: 'OpenAI - Chat Completions',
        description: '测试OpenAI聊天接口',
        category: TemplateCategory.OPENAI,
        request: {
          url: 'https://api.openai.com/v1/chat/completions',
          method: HttpMethod.POST,
          headers: {
            'Authorization': 'Bearer {{API_KEY}}',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hello!' }],
            max_tokens: 10,
          }, null, 2),
          timeout: 30000,
          variables: {
            API_KEY: '',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'default-claude-messages',
        name: 'Anthropic - Messages',
        description: '测试Claude API消息接口',
        category: TemplateCategory.ANTHROPIC,
        request: {
          url: 'https://api.anthropic.com/v1/messages',
          method: HttpMethod.POST,
          headers: {
            'x-api-key': '{API_KEY}',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello!' }],
          }, null, 2),
          timeout: 30000,
          variables: {
            API_KEY: '',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'default-gemini-models',
        name: 'Google AI - 获取模型列表',
        description: '验证Google AI API Key并获取模型',
        category: TemplateCategory.GOOGLE,
        request: {
          url: 'https://generativelanguage.googleapis.com/v1/models?key={API_KEY}',
          method: HttpMethod.GET,
          headers: {},
          timeout: 30000,
          variables: {
            API_KEY: '',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'default-custom-endpoint',
        name: '自定义端点测试',
        description: '自定义API端点测试模板',
        category: TemplateCategory.CUSTOM,
        request: {
          url: 'https://api.example.com/endpoint',
          method: HttpMethod.GET,
          headers: {
            'Authorization': 'Bearer {{API_KEY}}',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
          variables: {
            API_KEY: '',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * 验证请求配置
   * @param request - 要验证的请求配置
   * @returns 验证结果
   */
  static validateRequest(request: CustomRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 验证URL
    if (!request.url.trim()) {
      errors.push('URL不能为空');
    } else {
      try {
        // 替换变量后验证URL
        const processedUrl = this.replaceVariables(request.url, request.variables);
        new URL(processedUrl);
      } catch (error) {
        errors.push('URL格式无效');
      }
    }

    // 验证HTTP方法
    if (!Object.values(HttpMethod).includes(request.method)) {
      errors.push('无效的HTTP方法');
    }

    // 验证超时时间
    if (request.timeout <= 0 || request.timeout > 300000) {
      errors.push('超时时间必须在1-300000ms之间');
    }

    // 验证请求体（如果是POST/PUT/PATCH且有body）
    if (request.body && [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(request.method)) {
      try {
        JSON.parse(request.body);
      } catch (error) {
        // 如果不是JSON格式，只是警告
        console.warn('Request body is not valid JSON');
      }
    }

    // 验证请求头
    for (const [key, value] of Object.entries(request.headers)) {
      if (!key.trim()) {
        errors.push('请求头名称不能为空');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 格式化响应体
   * @param body - 响应体数据
   * @param contentType - 内容类型
   * @returns 格式化后的字符串
   */
  static formatResponseBody(body: any, contentType?: string): string {
    if (body === null || body === undefined) {
      return '';
    }

    if (typeof body === 'string') {
      // 尝试格式化JSON字符串
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        return body;
      }
    }

    if (typeof body === 'object') {
      return JSON.stringify(body, null, 2);
    }

    return String(body);
  }

  /**
   * 获取状态码描述
   * @param status - HTTP状态码
   * @returns 状态码描述文本
   */
  static getStatusDescription(status: number): string {
    const statusMap: Record<number, string> = {
      200: 'OK - 请求成功',
      201: 'Created - 资源创建成功',
      400: 'Bad Request - 请求参数错误',
      401: 'Unauthorized - 未授权或API Key无效',
      403: 'Forbidden - 禁止访问',
      404: 'Not Found - 资源不存在',
      429: 'Too Many Requests - 请求过于频繁',
      500: 'Internal Server Error - 服务器内部错误',
      502: 'Bad Gateway - 网关错误',
      503: 'Service Unavailable - 服务不可用',
    };

    return statusMap[status] || `HTTP ${status}`;
  }
} 