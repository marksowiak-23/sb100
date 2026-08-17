/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '@/src/services/api';

export const SANDBOX_USERS: User[] = [
  { user_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', email: 'john.doe@example.com', is_active: true, created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-01T08:00:00Z' },
  { user_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', email: 'jane.smith@example.com', is_active: true, created_at: '2026-07-01T08:30:00Z', updated_at: '2026-07-01T08:30:00Z' },
  { user_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', email: 'alex.jones@example.com', is_active: true, created_at: '2026-07-01T09:00:00Z', updated_at: '2026-07-01T09:00:00Z' },
  { user_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', email: 'emily.brown@example.com', is_active: true, created_at: '2026-07-01T09:15:00Z', updated_at: '2026-07-01T09:15:00Z' },
  { user_id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', email: 'michael.green@example.com', is_active: false, created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-01T11:30:00Z' },
  { user_id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', email: 'sarah.white@example.com', is_active: true, created_at: '2026-07-01T11:00:00Z', updated_at: '2026-07-01T11:00:00Z' },
  { user_id: 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', email: 'david.black@example.com', is_active: true, created_at: '2026-07-01T12:00:00Z', updated_at: '2026-07-01T12:00:00Z' },
  { user_id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', email: 'lisa.gray@example.com', is_active: true, created_at: '2026-07-01T13:00:00Z', updated_at: '2026-07-01T13:00:00Z' },
  { user_id: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', email: 'robert.taylor@example.com', is_active: true, created_at: '2026-07-01T14:00:00Z', updated_at: '2026-07-01T14:00:00Z' },
  { user_id: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', email: 'karen.wilson@example.com', is_active: false, created_at: '2026-07-01T15:00:00Z', updated_at: '2026-07-01T15:30:00Z' }
];
