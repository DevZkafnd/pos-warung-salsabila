declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  export default function withPWA(config: {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: any[];
    buildExcludes?: any[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    customWorkerDir?: string;
    fallbacks?: {
        image?: string;
        document?: string;
        font?: string;
        audio?: string;
        video?: string;
    };
    [key: string]: any;
  }): (nextConfig: NextConfig) => NextConfig;
}
