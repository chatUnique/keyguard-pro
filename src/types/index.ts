/**
 * API密钥相关类型定义
 */

// API密钥验证请求接口
export interface ApiKeyValidationRequest {
  apiKey: string;
  provider: AiProvider;
  requestFormat: RequestFormat;
  secretKey?: string; // 用于百度等需要secret的服务
}

// API密钥验证结果接口
export interface ApiKeyValidationResult {
  isValid: boolean;
  provider: AiProvider;
  requestFormat?: RequestFormat;
  status: KeyStatus;
  message: string;
  responseTime?: number;
  details?: {
    models?: string[];
    usage?: any;
    balance?: number;
    organization?: string;
    rateLimit?: {
      requests: number;
      tokens: number;
      resetTime: string;
    };
    accountInfo?: any;
  };
  error?: string;
}

// AI服务提供商枚举
export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface',
  BAIDU = 'baidu',
  QWEN = 'qwen',
  DOUBAO = 'doubao',
  MOONSHOT = 'moonshot',
  ZHIPU = 'zhipu',
  MINIMAX = 'minimax',
  CUSTOM = 'custom',
  // 国际服务商
  REPLICATE = 'replicate',
  TOGETHER = 'together',
  FIREWORKS = 'fireworks',
  GROQ = 'groq',
  PERPLEXITY = 'perplexity',
  XAI = 'xai',
  MISTRAL = 'mistral',
  STABILITY = 'stability',
  RUNWAY = 'runway',
  // 主流服务商
  OLLAMA = 'ollama',
  META = 'meta',
  COZE = 'coze',
  GITHUB_COPILOT = 'github_copilot',
  // 国内服务商
  DEEPSEEK = 'deepseek',
  ONEAI = '01ai',
  TENCENT = 'tencent',
  IFLYTEK = 'iflytek',
  SENSETIME = 'sensetime',
  BYTEDANCE = 'bytedance',
  LINGYI = 'lingyi',
  BAICHUAN = 'baichuan',
  KUNLUN = 'kunlun',
  ALIBABA_CLOUD = 'alibaba_cloud',
  HUAWEI = 'huawei',
  SILICONFLOW = 'siliconflow',
  // 其他服务商
  CLINE = 'cline',
  HUNYUAN = 'hunyuan',
  YUANBAO = 'yuanbao',
  VOLCENGINE = 'volcengine',
  MIDJOURNEY = 'midjourney',
}

// 请求格式枚举
export enum RequestFormat {
  NATIVE = 'native',        // 原生格式
  OPENAI_COMPATIBLE = 'openai-compatible', // OpenAI兼容格式
}

// API密钥状态枚举
export enum KeyStatus {
  PENDING = 'pending',      // 待检测
  CHECKING = 'checking',    // 检测中
  VALID = 'valid',         // 有效
  INVALID = 'invalid',     // 无效
  EXPIRED = 'expired',     // 已过期
  QUOTA_EXCEEDED = 'quota_exceeded', // 配额超限
  RATE_LIMITED = 'rate_limited',    // 频率限制
  FORMAT_ERROR = 'format_error',    // 格式错误
  ERROR = 'error',         // 错误
  UNKNOWN = 'unknown',     // 未知
}

// 批量检测相关类型
export interface BatchKeyItem {
  id: string;
  service: AiProvider;
  key: string;
  status: KeyStatus;
  result?: ApiKeyValidationResult;
  retryCount: number;
  checkTime?: number;
  createdAt: Date;
  customUrl?: string;
}

// 批量检测统计信息
export interface BatchStatistics {
  total: number;           // 总数
  completed: number;       // 已完成
  valid: number;          // 有效数
  invalid: number;        // 无效数
  errors: number;         // 错误数
  progress: number;       // 进度
  averageResponseTime: number; // 平均响应时间
  successRate: number;    // 成功率
}

// 批量处理器配置
export interface BatchProcessorConfig {
  concurrency: number;    // 并发数
  maxRetries: number;     // 最大重试次数
  retryDelay: number;     // 重试延迟
  timeout: number;        // 超时时间
}

// 自定义请求相关类型
export interface CustomRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  variables: Record<string, string>;
}

// 自定义响应类型
export interface CustomResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  error?: string;
}

// 模板类型
export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  request: CustomRequest;
  createdAt: Date;
  updatedAt: Date;
}

// HTTP方法枚举
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// 模板类别枚举
export enum TemplateCategory {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  CUSTOM = 'custom',
}

// 导出相关类型
export interface ExportConfig {
  format: ExportFormat;
  includeFields: string[];
  filterByStatus?: KeyStatus[];
  onlyValid?: boolean;
  filename?: string;
}

// 导出格式枚举
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

// 组件Props类型
export interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface TabNavigationProps {
  activeTab: DetectionTab;
  onTabChange: (tab: DetectionTab) => void;
}

// 单个密钥检测器Props
export interface SingleKeyDetectorProps {
  onResult: (result: ApiKeyValidationResult) => void;
}

// 批量密钥检测器Props
export interface BatchKeyDetectorProps {
  onBatchComplete: (results: BatchKeyItem[]) => void;
  onProgress: (progress: BatchStatistics) => void;
}

// 自定义URL测试器Props
export interface CustomUrlTesterProps {
  onResult: (response: CustomResponse) => void;
}

// 结果表格Props
export interface ResultTableProps {
  results: BatchKeyItem[];
  onExport: (config: ExportConfig) => void;
  onClear: () => void;
}

// 统计面板Props
export interface StatisticsPanelProps {
  statistics: BatchStatistics;
}

// 检测标签页枚举
export enum DetectionTab {
  SINGLE = 'single',    // 单个检测
  BATCH = 'batch',      // 批量检测
  CUSTOM = 'custom',    // 自定义检测
}

// 服务商配置接口
export interface ProviderConfig {
  name: string;
  keyFormat: RegExp;
  keyExample: string;
  supportedFormats: RequestFormat[];
  needsSecretKey?: boolean;
  endpoints: {
    [RequestFormat.NATIVE]?: string;
    [RequestFormat.OPENAI_COMPATIBLE]?: string;
  };
  headers: {
    [RequestFormat.NATIVE]?: Record<string, string>;
    [RequestFormat.OPENAI_COMPATIBLE]?: Record<string, string>;
  };
}

// 按钮Props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

// 输入框Props
export interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  rows?: number;
}

// 选择器Props
export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

// 选择器选项
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

// 动画变体
export interface AnimationVariants {
  hidden: any;
  visible: any;
}

// 交错动画Props
export interface StaggerAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

// 密钥检测Hook返回值
export interface UseKeyDetectionReturn {
  isDetecting: boolean;
  results: BatchKeyItem[];
  statistics: BatchStatistics;
  detectSingle: (key: string, provider: AiProvider, customUrl?: string) => Promise<ApiKeyValidationResult>;
  detectBatch: (items: BatchKeyItem[]) => Promise<void>;
  pauseDetection: () => void;
  resumeDetection: () => void;
  stopDetection: () => void;
  clearResults: () => void;
  exportResults: (config: ExportConfig) => void;
  updateResult: (id: string, result: ApiKeyValidationResult) => void;
}

// 模板Hook返回值
export interface UseTemplatesReturn {
  templates: Template[];
  isLoading: boolean;
  saveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Template;
  updateTemplate: (id: string, template: Partial<Template>) => Template | null;
  deleteTemplate: (id: string) => boolean;
  loadTemplate: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  importTemplates: (data: Template[]) => void;
  exportTemplates: () => Template[];
  duplicateTemplate: (id: string) => Template | null;
  searchTemplates: (query: string) => Template[];
  validateTemplate: (template: Partial<Template>) => { isValid: boolean; errors: string[] };
  getTemplateStats: () => {
    total: number;
    byCategory: Record<TemplateCategory, number>;
    recentlyCreated: number;
    recentlyUpdated: number;
  };
  resetTemplates: () => void;
  exportToFile: (filename?: string) => void;
  importFromFile: (file: File) => Promise<void>;
}

// 暗色模式Hook返回值
export interface UseDarkModeReturn {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

// 断点配置
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

// 验证错误
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// 应用错误
export interface AppError {
  message: string;
  code: string;
  details?: any;
  timestamp: Date;
}

// 主题颜色
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

// 主题配置
export interface Theme {
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
} 