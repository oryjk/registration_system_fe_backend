declare module "element-plus/dist/locale/zh-cn.mjs";

interface Window {
  wx: {
    config: (config: {
      debug: boolean;
      appId: string;
      timestamp: string;
      nonceStr: string;
      signature: string;
      jsApiList: string[];
    }) => void;
    ready: (callback: () => void) => void;
    error: (callback: (err: any) => void) => void;
  };
}
