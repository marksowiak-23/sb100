import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';

function getGitCommitCount(): string {
  try {
    return execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '1';
  }
}

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

function getPackageVersion(): string {
  try {
    const pkgJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
    return pkgJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appEnv = env.VITE_APP_ENV || mode || 'dev';
  const buildInfo = {
    version: getPackageVersion(),
    buildNumber: getGitCommitCount(),
    commitHash: getGitCommitHash(),
    buildDate: new Date().toISOString(),
    environment: appEnv,
  };

  return {
    define: {
      __APP_BUILD_INFO__: JSON.stringify(buildInfo),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
