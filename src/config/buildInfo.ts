/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BuildInfo {
  version: string;
  buildNumber: string;
  commitHash: string;
  buildDate: string;
  environment: string;
}

export const BUILD_INFO: BuildInfo = typeof __APP_BUILD_INFO__ !== 'undefined'
  ? __APP_BUILD_INFO__
  : {
      version: '1.0.0',
      buildNumber: '1',
      commitHash: 'dev',
      buildDate: new Date().toISOString(),
      environment: 'dev',
    };

/**
 * Returns a human-friendly build label, e.g.:
 * "v1.0.0 (Build #95 • f9bfaf8) [dev]"
 */
export function getBuildDisplayLabel(): string {
  return `v${BUILD_INFO.version} (Build #${BUILD_INFO.buildNumber} • ${BUILD_INFO.commitHash}) [${BUILD_INFO.environment}]`;
}
