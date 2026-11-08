# SBook Developer Roadmap & TODO List

This document outlines key architectural milestones and actionable tasks for the development team across the SBook ecosystem (`sb-api`, `sb100`, `sb-admin-web`, `sb-dbs`, `sb-api-ai`, `sb-api-media`).

---

## Priority Milestones Overview

| # | Milestone | Primary Services Involved | Complexity | Target Phase |
|---|---|---|---|---|
| **1** | [Refactor Registration to Include Email MFA](#1-refactor-registration-process-to-include-email-mfa) | `sb-api`, `sb100`, `sb-dbs` | Medium | Phase 1 |
| **2** | [Implement Google & Apple Logon (OAuth2 / OIDC)](#2-implement-google-and-apple-logon) | `sb-api`, `sb100`, `sb-dbs` | Medium | Phase 1 |
| **3** | [Implement Member-to-Member Web Messaging](#3-implement-member-to-member-web-messaging) | `sb-api`, `sb100`, `sb-dbs` | High | Phase 2 |
| **4** | [Implement Member-to-Internet Email Messaging](#4-implement-member-to-internet-email-messaging) | `sb-api`, `sb100`, `sb-dbs`, Cloud Tasks | High | Phase 2 |
| **5** | [Refactor Print and Publish Book Pipeline](#5-refactor-print-and-publish-book) | `sb-api`, `sb100`, `sb-api-media`, `sb-dbs` | High | Phase 3 |

---

## 1. Refactor Registration Process to Include Email MFA

### Objective
Enhance member registration and security by enforcing two-factor authentication (Email OTP verification) prior to activating new member accounts, preventing bot spam and unverified credentials.

### Tasks
- [ ] **Database Schema (`sb-dbs`)**:
  - Add `user_mfa_verification` table (or columns on `user` table: `mfa_email_otp_hash`, `mfa_otp_expires_at`, `mfa_attempts_count`, `email_verified_at`).
  - Follow the *Five-Step Database Modification Protocol* (migration script, baseline DDL, docs).
- [ ] **Backend API (`sb-api`)**:
  - Update `/auth/register` to create accounts in `PENDING_VERIFICATION` status without issuing long-lived access tokens immediately.
  - Implement `/auth/mfa/send-code` with secure 6-digit cryptographically random OTP generation (10-minute expiration).
  - Implement rate limiting (maximum 3 resends per hour, IP-based protection).
  - Add transactional email dispatcher service (SendGrid / AWS SES / SMTP / Google Cloud Tasks) using SBook branded HTML email template.
  - Implement `/auth/mfa/verify-code` to validate OTP, transition user status to `ACTIVE`, and return the authenticated JWT session.
- [ ] **Frontend Application (`sb100`)**:
  - Refactor registration wizard into a 2-step flow:
    - Step 1: Profile & Credentials entry.
    - Step 2: Modern 6-cell OTP entry screen with auto-focus, paste support, 60-second resend countdown timer, and change-email option.
  - Support Sandbox mock OTP code (e.g., `123456`) in Sandbox mode.
- [ ] **Admin Verification (`sb-admin-web`)**:
  - Display email verification status and verification timestamp in Admin User Management screens.

---

## 2. Implement Google and Apple Logon

### Objective
Streamline member onboarding and login by adding one-click federated identity authentication via Google Identity Services and Sign in with Apple.

### Tasks
- [ ] **External Credentials & Configuration**:
  - Setup Google Cloud Console OAuth 2.0 Client ID (Web & iOS/Android origins).
  - Setup Apple Developer Account Services ID, Key ID, Team ID, and Private Key (`.p8` file in Secret Manager).
  - Add environment variables to `.env` across dev/stage/prod:
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    - `APPLE_SERVICE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
- [ ] **Database Schema (`sb-dbs`)**:
  - Add `user_oauth_identity` table (mapping `user_id`, `provider_cd` [`GOOGLE`, `APPLE`], `provider_user_id`, `provider_email`, `created_at`).
  - Update schema documentation in `sb-dbs/docs/tables/`.
- [ ] **Backend API (`sb-api`)**:
  - Implement `POST /auth/oauth/google`: Verify Google ID token using `google-auth` library, match or auto-provision `user` + `mbr` record, and return SBook JWT.
  - Implement `POST /auth/oauth/apple`: Verify Apple Identity JWT and handle Apple authorization response (including user name payload provided only on first authorization).
  - Implement account linking logic when an existing registered email matches the OAuth provider email.
- [ ] **Frontend Application (`sb100`)**:
  - Add branded "Continue with Google" and "Sign in with Apple" buttons on Login and Registration screens.
  - Handle OAuth redirect or popup flows using official SDKs (`@react-oauth/google`, Apple JS SDK).
  - Support sandbox bypass/mock profiles for offline testing.

---

## 3. Implement Member to Member Web Messaging

### Objective
Enable secure, contextual in-app messaging between connected members (family circles, genealogy collaborators, and friends) to discuss shared stories, heirloom photos, and life events.

### Tasks
- [ ] **Database Schema (`sb-dbs`)**:
  - Create `mbr_message_thread`: Thread type (`DIRECT`, `GROUP`, `STORY_INQUIRY`), title, last message timestamp.
  - Create `mbr_message_thread_participant`: `thread_id`, `mbr_id`, `joined_at`, `last_read_message_id`, `muted_yn`.
  - Create `mbr_message`: `message_id`, `thread_id`, `sender_mbr_id`, `message_text`, `message_type_cd` (`TEXT`, `PHOTO`, `STORY_LINK`), `created_at`, `is_deleted`.
  - Create `mbr_message_attachment`: Media attachment references.
  - Document all tables in `sb-dbs/docs/tables/table_mbrMessage*.md`.
- [ ] **Backend API (`sb-api`)**:
  - Implement REST endpoints:
    - `GET /mbr-messages/threads`: List active conversations with unread counts and participant avatars.
    - `POST /mbr-messages/threads`: Create or retrieve existing direct thread.
    - `GET /mbr-messages/threads/{thread_id}/messages`: Paginated message history (infinite scroll).
    - `POST /mbr-messages/threads/{thread_id}/messages`: Send message and handle attachments.
    - `POST /mbr-messages/threads/{thread_id}/read`: Mark thread messages as read.
  - Implement real-time communication via WebSocket (`/ws/messaging/{mbr_id}`) or SSE for instant message and typing indicators.
  - Enforce member connection permissions (members must have accepted connection privilege before initiating non-moderated direct messages).
- [ ] **Frontend Application (`sb100`)**:
  - Create `MbrMessagingCenter` component (split-pane desktop layout: thread sidebar + active chat window; mobile responsive drawer).
  - Support rich context sharing (e.g. "Share Story to Family Chat" button on published stories).
  - Real-time unread counter badge in top navigation bar.
  - Dual Mode support: Live DB via `taskApi` + Sandbox mode with simulated replies.

---

## 4. Implement Member to Internet Email Messaging

### Objective
Allow members to invite, share stories with, and communicate with external family members who do not yet have an SBook account, bridging the gap between web messaging and regular email inboxes.

### Tasks
- [ ] **Email Infrastructure & Webhooks**:
  - Configure inbound email parsing (e.g. SendGrid Inbound Parse or AWS SES) for `replies.sbook.family` or `mail.sbook.family`.
  - Route inbound MX records to `POST /api/webhooks/inbound-email` on `sb-api`.
- [ ] **Database Schema (`sb-dbs`)**:
  - Create `mbr_email_thread`: Maps internal `mbr_id` to external `recipient_email` with a unique cryptographic HMAC token for reply matching (`reply+<token>@mail.sbook.family`).
  - Create `mbr_email_message`: `email_id`, `thread_id`, `direction_cd` (`OUTBOUND`, `INBOUND`), `subject`, `body_html`, `body_text`, `delivery_status_cd`, `sent_at`.
- [ ] **Backend API (`sb-api`)**:
  - Implement `POST /mbr-email-messages/send`: Send outbound email from member to any valid external email address with SBook heirloom styling.
  - Implement webhook receiver `POST /webhooks/inbound-email`: Validate HMAC signature, parse inbound text/attachments, map back to member's conversation thread, and trigger in-app notification.
  - Implement SPF/DKIM/DMARC alignment to ensure inbox deliverability.
- [ ] **Frontend Application (`sb100`)**:
  - Add "Send via Email" action in `MbrContacts` and `MbrStory` share modals.
  - Unified inbox view showing both web threads and external email threads with clear channel indicators (`Web` vs `Email`).

---

## 5. Refactor Print and Publish Book

### Objective
Elevate the StoryBook print-on-demand engine into an enterprise-grade publishing system capable of rendering ultra-high-resolution print files without browser memory constraints, supporting automated Lulu Direct fulfillment, status webhooks, and advanced proofing.

### Tasks
- [ ] **Decouple PDF Rendering (Client-Side vs Server-Side Microservice)**:
  - Transition large volume rendering (>100 pages, dozens of 300+ DPI photos) from client jsPDF to a dedicated asynchronous backend worker (using headless Chromium or PDF generation service in `sb-api` / `sb-api-media`).
  - Queue print generation jobs in Cloud Tasks or Celery with progress polling.
  - Upload finished high-res PDFs directly to Google Cloud Storage with signed download URLs.
- [ ] **Lulu Direct Full-Cycle Integration (`sb-api`)**:
  - Implement webhook endpoint `POST /webhooks/lulu/status` to receive real-time updates from Lulu:
    - Status codes: `IN_PREFLIGHT`, `ACCEPTED`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
  - Automatically update `mbr_story_book_order` table and trigger email notification with live carrier tracking URL (USPS, FedEx, UPS).
  - Store international address validation and shipping quotes for global fulfillment.
- [ ] **Enhanced Cover & Interior Design Studio (`sb100`)**:
  - Interactive 3D flipbook realistic preview before ordering (page-turning animation).
  - Dynamic spine calculation based on precise paper grammage and exact page count.
  - Custom back-cover barcode & ISBN auto-placement.
  - Multiple volume series manager (e.g. Volume I: Early Childhood, Volume II: Career & Family).
- [ ] **Admin & Order Management (`sb-admin-web`)**:
  - Administrative dashboard for all StoryBook print orders across members.
  - Order retry and manual reprint capabilities for print damages.
  - Lulu API health monitor and monthly printing expenditure analytics.

---
*Created and maintained by the SBook Full-Stack Engineering Team.*

