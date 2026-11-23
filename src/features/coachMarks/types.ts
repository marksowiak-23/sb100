/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CoachTourId =
  | 'home_tour'
  | 'author_tour'
  | 'feed_tour'
  | 'connections_tour'
  | 'profile_tour'
  | 'account_tour'
  | 'preferences_tour'
  | 'privacy_tour';

export type CoachMarkPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface CoachMarkStep {
  /** Matches `data-coach-mark="<targetId>"` in the DOM */
  targetId: string;
  /** Short badge label (e.g., "Author Studio", "AI Tools") */
  badge?: string;
  /** Engaging headline for the callout card */
  title: string;
  /** Clear, concise 1–2 sentence guidance copy */
  description: string;
  /** Preferred popover placement relative to target (auto-flips if clipped) */
  placement?: CoachMarkPlacement;
}

export interface CoachTourDefinition {
  id: CoachTourId;
  name: string;
  steps: CoachMarkStep[];
}
