/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HomePageHeaderPanel, { HomePageHeaderPanelProps } from './HomePageHeaderPanel';

export default function BrandHeaderPanel(props: HomePageHeaderPanelProps) {
  return <HomePageHeaderPanel {...props} />;
}

export { BrandHeaderPanel, BrandHeaderPanel as brandHeaderPanel, BrandHeaderPanel as SbBrandHeaderCard };
