/**
 * 扩展全局Window接口
 * 添加网络状态相关的类型定义
 */
declare global {
  interface Window {
    networkStatus?: {
      direct: boolean;      // 直连状态
      proxy: boolean;       // 代理状态
      recommended: 'direct' | 'proxy';  // 推荐连接方式
      isChecking: boolean;  // 是否正在检查
      lastCheck?: Date;     // 最后检查时间
    };
  }
}

export {}; 