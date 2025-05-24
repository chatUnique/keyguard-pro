// 扩展全局 Window 接口
declare global {
  interface Window {
    networkStatus?: {
      direct: boolean;
      proxy: boolean;
      recommended: 'direct' | 'proxy';
      isChecking: boolean;
      lastCheck?: Date;
    };
  }
}

export {}; 