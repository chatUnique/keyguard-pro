// API Key相关类型
export interface ApiKeyValidationRequest {
  apiKey: string;
  provider: AiProvider;
  requestFormat: RequestFormat;
  secretKey?: string; // 用于百度等需要secret的服务
}

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

// AI服务提供商枚举（扩展）
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
  // 新增国际服务商
  REPLICATE = 'replicate',
  TOGETHER = 'together',
  FIREWORKS = 'fireworks',
  GROQ = 'groq',
  PERPLEXITY = 'perplexity',
  XAI = 'xai',
  MISTRAL = 'mistral',
  STABILITY = 'stability',
  RUNWAY = 'runway',
  // 新增主流服务商
  OLLAMA = 'ollama',
  META = 'meta',
  COZE = 'coze',
  GITHUB_COPILOT = 'github_copilot',
  // 新增国内服务商
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
  // 新增其他服务商
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

// API Key状态枚举
export enum KeyStatus {
  PENDING = 'pending',
  CHECKING = 'checking',
  VALID = 'valid',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  QUOTA_EXCEEDED = 'quota_exceeded',
  RATE_LIMITED = 'rate_limited',
  FORMAT_ERROR = 'format_error',
  ERROR = 'error',
  UNKNOWN = 'unknown',
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

export interface BatchStatistics {
  total: number;
  completed: number;
  valid: number;
  invalid: number;
  errors: number;
  progress: number;
  averageResponseTime: number;
  successRate: number;
}

export interface BatchProcessorConfig {
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
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

export interface CustomResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  error?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  request: CustomRequest;
  createdAt: Date;
  updatedAt: Date;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

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

export interface SingleKeyDetectorProps {
  onResult: (result: ApiKeyValidationResult) => void;
}

export interface BatchKeyDetectorProps {
  onBatchComplete: (results: BatchKeyItem[]) => void;
  onProgress: (progress: BatchStatistics) => void;
}

export interface CustomUrlTesterProps {
  onResult: (response: CustomResponse) => void;
}

export interface ResultTableProps {
  results: BatchKeyItem[];
  onExport: (config: ExportConfig) => void;
  onClear: () => void;
}

export interface StatisticsPanelProps {
  statistics: BatchStatistics;
}

export enum DetectionTab {
  SINGLE = 'single',
  BATCH = 'batch',
  CUSTOM = 'custom',
}

// AI Provider 配置信息
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

// 通用UI组件Props
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

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

// 动画相关类型
export interface AnimationVariants {
  hidden: any;
  visible: any;
}

export interface StaggerAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

// Hook 返回类型
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

export interface UseDarkModeReturn {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

// 响应式断点类型
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

// 错误类型
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AppError {
  message: string;
  code: string;
  details?: any;
  timestamp: Date;
}

// 主题相关类型
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