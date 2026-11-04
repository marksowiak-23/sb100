/// <reference types="vite/client" />

interface AppBuildInfo {
  version: string;
  buildNumber: string;
  commitHash: string;
  buildDate: string;
  environment: string;
}

declare const __APP_BUILD_INFO__: AppBuildInfo;
