# Jain Kahaniyan Vachanalaya

## Backend and Admin Panel Specification

Version: 1.0
Date: 2026-09-08

This document defines the backend, database, API, authentication, media storage, and admin panel needed to move the current frontend from local/static data to a production application.

## 1. Current Application State

The current frontend has:

- Static story and library content in `src/data/content.ts`.
- Client-side bookmarks, reading progress, recently viewed items, quiz history, and audio history in `localStorage`.
- A local player state in `src/lib/player.tsx`.
- TanStack Start/Vite server entry in `src/server.ts`.
- Public routes for stories, Tirthankars, philosophy, audio, quizzes, library, search, children, and saved content.

The backend should replace static content and local persistence without changing the public URL structure.

## 2. Recommended Architecture

### Stack

- Frontend: existing React + TanStack Start.
- API: TanStack Start server functions or versioned REST routes under `/api/v1`.
- Database: PostgreSQL.
- ORM: Drizzle ORM or Prisma. Use one ORM consistently.
- Authentication: email/password plus magic link or OAuth; issue short-lived access tokens and rotating refresh tokens.
- Media: S3-compatible object storage such as Cloudflare R2, AWS S3, or Supabase Storage.
- Image processing: resize and optimize covers to WebP/AVIF.
- Audio delivery: private originals, CDN-backed public signed URLs.
- Email: Resend, Postmark, or another transactional email provider.
- Background jobs: queue for audio metadata, image processing, search indexing, and analytics aggregation.
- Search: PostgreSQL full-text search initially; Meilisearch/OpenSearch only when the catalog becomes large.
- Monitoring: structured logs, error tracking, request IDs, uptime checks, and audit logs.

### Environments

- `development`: local database and local storage bucket.
- `staging`: production-like database and storage with test data.
- `production`: backups, CDN, monitoring, rate limits, and restricted admin access.

Never use the production database from a developer laptop.

## 3. Roles and Permissions

| Role          | Permissions                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `reader`      | Read published content, play audio, save items, submit quiz answers, manage own profile                  |
| `editor`      | Create and edit stories, chapters, philosophy topics, Tirthankars, quizzes, and media; submit for review |
| `reviewer`    | Review submitted content, request changes, approve or reject publishing                                  |
| `admin`       | All content operations, users, roles, settings, audit logs, and publishing                               |
| `super_admin` | Admin plus role management, billing/infrastructure settings, and destructive maintenance                 |

Permission checks must run on the server for every protected endpoint. Hiding an admin button in the frontend is not authorization.

Suggested permission names:

```text
content.read
content.create
content.update
content.delete
content.publish
media.manage
quiz.manage
users.read
users.manage
roles.manage
settings.manage
audit.read
```

## 4. Content Lifecycle

Every editable content item uses this lifecycle:

```text
draft -> in_review -> scheduled -> published -> archived
                     |                  |
                     +-> changes_needed <-+
```

Rules:

- Public APIs return only `published` content unless an explicit preview token is supplied.
- Editors can save drafts and submit them for review.
- Reviewers can approve, reject, or request changes.
- Only reviewers/admins can publish.
- Published content should use soft deletion (`archived_at`) rather than immediate hard deletion.
- Every status change creates an audit log entry.
- A slug must be unique among non-archived records.

## 5. Database Model

All tables should include `id` as UUID, `created_at`, and `updated_at`. Use UTC timestamps. Add `created_by` and `updated_by` to admin-managed tables.

### 5.1 users

```sql
users (
  id uuid primary key,
  email text unique not null,
  password_hash text null,
  name text,
  avatar_url text,
  preferred_language text not null default 'hi',
  role text not null default 'reader',
  is_active boolean not null default true,
  email_verified_at timestamptz null,
  last_login_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

Do not expose `password_hash` in any API response.

### 5.2 refresh_tokens

```sql
refresh_tokens (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null
)
```

Store only a hash of the refresh token.

### 5.3 stories

```sql
stories (
  id uuid primary key,
  slug text unique not null,
  title_hi text not null,
  title_en text null,
  latin_title text null,
  summary_hi text not null,
  summary_en text null,
  category_id uuid references categories(id),
  cover_media_id uuid references media(id),
  reading_minutes integer not null default 1,
  status text not null default 'draft',
  featured boolean not null default false,
  seo_title text null,
  seo_description text null,
  published_at timestamptz null,
  archived_at timestamptz null,
  created_by uuid references users(id),
  updated_by uuid references users(id),
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

### 5.4 chapters

```sql
chapters (
  id uuid primary key,
  story_id uuid references stories(id) on delete cascade,
  chapter_number integer not null,
  title_hi text not null,
  title_en text null,
  body_hi jsonb not null,
  body_en jsonb null,
  audio_media_id uuid references media(id),
  status text not null default 'draft',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (story_id, chapter_number)
)
```

`body_hi` should be a structured document, not an HTML string:

```json
{
  "blocks": [
    { "type": "paragraph", "text": "कथा का पहला अनुच्छेद..." },
    { "type": "quote", "text": "जियो और जीने दो" },
    { "type": "paragraph", "text": "कथा का दूसरा अनुच्छेद..." }
  ]
}
```

Allowed block types should be validated by a server-side schema.

### 5.5 categories

```sql
categories (
  id uuid primary key,
  slug text unique not null,
  name_hi text not null,
  name_en text null,
  description_hi text null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

### 5.6 tirthankars

```sql
tirthankars (
  id uuid primary key,
  number integer unique not null check (number between 1 and 24),
  slug text unique not null,
  name_hi text not null,
  name_en text null,
  symbol_hi text null,
  birth_place_hi text null,
  parents_hi text null,
  lifespan_text_hi text null,
  introduction_hi text not null,
  teachings_hi jsonb not null default '[]',
  cover_media_id uuid references media(id),
  status text not null default 'draft',
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

### 5.7 philosophy_topics

```sql
philosophy_topics (
  id uuid primary key,
  slug text unique not null,
  title_hi text not null,
  title_en text null,
  short_description_hi text not null,
  body_hi jsonb not null,
  icon_key text null,
  sort_order integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

Examples: Ahimsa, Anekantavada, Aparigraha, Karma Siddhant, Nav Tattva, Moksha, Samyak Darshan, Samyak Gyan, and Samyak Charitra.

### 5.8 quizzes and quiz_questions

```sql
quizzes (
  id uuid primary key,
  slug text unique not null,
  title_hi text not null,
  description_hi text null,
  difficulty text not null default 'easy',
  time_limit_seconds integer null,
  status text not null default 'draft',
  created_at timestamptz not null,
  updated_at timestamptz not null
)

quiz_questions (
  id uuid primary key,
  quiz_id uuid references quizzes(id) on delete cascade,
  question_number integer not null,
  question_hi text not null,
  options jsonb not null,
  correct_option_key text not null,
  explanation_hi text null,
  points integer not null default 1,
  unique (quiz_id, question_number)
)
```

Never send `correct_option_key` to the browser before the user submits an answer.

### 5.9 media

```sql
media (
  id uuid primary key,
  type text not null,
  storage_key text unique not null,
  original_name text not null,
  mime_type text not null,
  bytes bigint not null,
  duration_seconds integer null,
  width integer null,
  height integer null,
  alt_text_hi text null,
  status text not null default 'processing',
  uploaded_by uuid references users(id),
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

Allowed media types: `image`, `audio`, `document`.

### 5.10 user activity

```sql
bookmarks (
  user_id uuid references users(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  created_at timestamptz not null,
  primary key (user_id, story_id)
)

reading_progress (
  user_id uuid references users(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  position_seconds integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null,
  primary key (user_id, story_id)
)

recent_views (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  viewed_at timestamptz not null
)

quiz_attempts (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  score integer not null,
  total integer not null,
  answers jsonb not null,
  submitted_at timestamptz not null
)
```

### 5.11 operations

```sql
audit_logs (
  id uuid primary key,
  actor_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  before_data jsonb null,
  after_data jsonb null,
  ip_address inet null,
  user_agent text null,
  created_at timestamptz not null
)

site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references users(id),
  updated_at timestamptz not null
)
```

## 6. API Conventions

Base URL:

```text
/api/v1
```

Headers:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
X-Request-ID: <client-generated-uuid>
```

Successful response envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-09-08T12:00:00.000Z"
  }
}
```

List response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7,
    "requestId": "req_123"
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "fields": {
      "title_hi": "Required"
    },
    "requestId": "req_123"
  }
}
```

HTTP status rules:

- `200`: successful read/update/action.
- `201`: created.
- `204`: successful delete with no response body.
- `400`: malformed request.
- `401`: missing or invalid authentication.
- `403`: authenticated but not allowed.
- `404`: resource does not exist or is not visible.
- `409`: duplicate slug, email, or conflicting state.
- `422`: validation error.
- `429`: rate limit exceeded.
- `500`: unexpected server error.

Pagination:

```text
?page=1&limit=20&sort=created_at&order=desc
```

Never allow arbitrary SQL column names in `sort`; use a server-side allowlist.

## 7. Authentication API

### Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Ravi Jain",
  "email": "ravi@example.com",
  "password": "A-strong-password-123",
  "preferredLanguage": "hi"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "usr_01",
      "name": "Ravi Jain",
      "email": "ravi@example.com",
      "role": "reader",
      "preferredLanguage": "hi"
    },
    "accessToken": "eyJ...",
    "expiresIn": 900
  }
}
```

### Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "ravi@example.com",
  "password": "A-strong-password-123"
}
```

### Refresh and logout

```http
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Use an HTTP-only, Secure, SameSite refresh-token cookie when possible. Keep access tokens short-lived.

## 8. Public API

Public endpoints return published content only.

```text
GET /api/v1/stories
GET /api/v1/stories/:slug
GET /api/v1/stories/:slug/chapters
GET /api/v1/stories/:slug/related
GET /api/v1/categories
GET /api/v1/tirthankars
GET /api/v1/tirthankars/:slug
GET /api/v1/philosophy
GET /api/v1/philosophy/:slug
GET /api/v1/quizzes
GET /api/v1/quizzes/:slug
GET /api/v1/search?q=mahavir&type=all&page=1&limit=20
GET /api/v1/settings/public
```

### Story list query

```text
GET /api/v1/stories?category=ahimsa-katha&featured=true&page=1&limit=12
```

### Story response

```json
{
  "data": {
    "id": "story_01",
    "slug": "bhagwan-mahavir-charitra",
    "title": "भगवान महावीर चरित्र",
    "latinTitle": "Bhagwan Mahavir Charitra",
    "category": {
      "slug": "tirthankar-katha",
      "name": "तीर्थंकर कथा"
    },
    "cover": {
      "url": "https://cdn.example.com/covers/mahavir.webp",
      "alt": "भगवान महावीर चरित्र"
    },
    "readingMinutes": 18,
    "summary": "राजकुमार वर्धमान से भगवान महावीर तक...",
    "chapters": [
      {
        "id": "chapter_01",
        "number": 1,
        "title": "क्षत्रियकुंड में जन्म",
        "blocks": [{ "type": "paragraph", "text": "..." }],
        "audio": {
          "id": "media_01",
          "durationSeconds": 932,
          "streamUrl": "https://cdn.example.com/signed-url"
        }
      }
    ],
    "related": ["mahavir-aur-chandkaushik", "gautam-swami"]
  }
}
```

The frontend should map this response to the existing `Story` shape during migration.

## 9. User API

All endpoints below require a logged-in user.

```text
GET    /api/v1/me
PATCH  /api/v1/me
DELETE /api/v1/me
GET    /api/v1/me/bookmarks
POST   /api/v1/me/bookmarks
DELETE /api/v1/me/bookmarks/:storyId
GET    /api/v1/me/progress
PUT    /api/v1/me/progress/:storyId
GET    /api/v1/me/recent
POST   /api/v1/me/recent
GET    /api/v1/me/quiz-attempts
```

### Update profile

```http
PATCH /api/v1/me
```

```json
{
  "name": "Ravi Jain",
  "preferredLanguage": "hi",
  "avatarMediaId": "media_avatar_01"
}
```

### Add bookmark

```http
POST /api/v1/me/bookmarks
```

```json
{
  "storyId": "story_01"
}
```

The operation must be idempotent. Repeating it should not create duplicates.

### Save reading progress

```http
PUT /api/v1/me/progress/story_01
```

```json
{
  "chapterId": "chapter_01",
  "positionSeconds": 45,
  "completed": false
}
```

### Submit a quiz

```http
POST /api/v1/quizzes/quiz_01/attempts
```

```json
{
  "answers": [
    { "questionId": "question_01", "optionKey": "b" },
    { "questionId": "question_02", "optionKey": "a" }
  ]
}
```

Response:

```json
{
  "data": {
    "attemptId": "attempt_01",
    "score": 8,
    "total": 10,
    "percentage": 80,
    "results": [
      {
        "questionId": "question_01",
        "correct": true,
        "correctOptionKey": "b",
        "explanation": "..."
      }
    ]
  }
}
```

Rate-limit quiz submissions and never trust a score supplied by the client.

## 10. Admin API

All admin routes require authentication and a permission check.

### Stories and chapters

```text
GET    /api/v1/admin/stories
POST   /api/v1/admin/stories
GET    /api/v1/admin/stories/:id
PATCH  /api/v1/admin/stories/:id
DELETE /api/v1/admin/stories/:id
POST   /api/v1/admin/stories/:id/submit-review
POST   /api/v1/admin/stories/:id/publish
POST   /api/v1/admin/stories/:id/archive
POST   /api/v1/admin/stories/:id/duplicate

POST   /api/v1/admin/stories/:storyId/chapters
PATCH  /api/v1/admin/chapters/:id
DELETE /api/v1/admin/chapters/:id
PUT    /api/v1/admin/stories/:storyId/reorder-chapters
```

### Create story payload

```json
{
  "slug": "bhagwan-mahavir-charitra",
  "titleHi": "भगवान महावीर चरित्र",
  "titleEn": "Life of Lord Mahavira",
  "latinTitle": "Bhagwan Mahavir Charitra",
  "summaryHi": "राजकुमार वर्धमान से भगवान महावीर तक...",
  "categoryId": "category_01",
  "coverMediaId": "media_cover_01",
  "readingMinutes": 18,
  "featured": true,
  "seoTitle": "भगवान महावीर चरित्र | जैन कहानियाँ",
  "seoDescription": "भगवान महावीर के जीवन और संदेश की कथा।"
}
```

### Update story payload

Use partial updates:

```json
{
  "summaryHi": "नया सारांश...",
  "readingMinutes": 20,
  "status": "draft"
}
```

The server must reject immutable or protected fields such as `id`, `createdBy`, and `publishedAt` from ordinary editor updates.

### Create chapter payload

```json
{
  "chapterNumber": 1,
  "titleHi": "क्षत्रियकुंड में जन्म",
  "bodyHi": {
    "blocks": [
      { "type": "paragraph", "text": "वैशाली के निकट..." },
      { "type": "quote", "text": "जियो और जीने दो" }
    ]
  },
  "audioMediaId": "media_audio_01"
}
```

### Tirthankars

```text
GET    /api/v1/admin/tirthankars
POST   /api/v1/admin/tirthankars
GET    /api/v1/admin/tirthankars/:id
PATCH  /api/v1/admin/tirthankars/:id
DELETE /api/v1/admin/tirthankars/:id
POST   /api/v1/admin/tirthankars/:id/publish
```

Payload:

```json
{
  "number": 24,
  "slug": "mahavir-swami",
  "nameHi": "महावीर स्वामी",
  "nameEn": "Mahavira Swami",
  "symbolHi": "सिंह",
  "birthPlaceHi": "क्षत्रियकुंड",
  "introductionHi": "चौबीसवें तीर्थंकर...",
  "teachingsHi": ["अहिंसा", "अनेकांतवाद", "अपरिग्रह"],
  "coverMediaId": "media_mahavir_01"
}
```

### Philosophy

```text
GET    /api/v1/admin/philosophy
POST   /api/v1/admin/philosophy
GET    /api/v1/admin/philosophy/:id
PATCH  /api/v1/admin/philosophy/:id
DELETE /api/v1/admin/philosophy/:id
PUT    /api/v1/admin/philosophy/reorder
```

Payload:

```json
{
  "slug": "nav-tattva",
  "titleHi": "नव तत्व",
  "titleEn": "Nine Tattvas",
  "shortDescriptionHi": "जैन दर्शन के नौ मूल तत्व...",
  "bodyHi": {
    "blocks": [
      { "type": "heading", "text": "जीव से मोक्ष तक" },
      { "type": "diagram", "items": ["जीव", "अजीव", "आस्रव", "बंध", "संवर", "निर्जरा", "मोक्ष"] }
    ]
  },
  "sortOrder": 1
}
```

### Quizzes

```text
GET    /api/v1/admin/quizzes
POST   /api/v1/admin/quizzes
GET    /api/v1/admin/quizzes/:id
PATCH  /api/v1/admin/quizzes/:id
DELETE /api/v1/admin/quizzes/:id
POST   /api/v1/admin/quizzes/:quizId/questions
PATCH  /api/v1/admin/quiz-questions/:id
DELETE /api/v1/admin/quiz-questions/:id
PUT    /api/v1/admin/quizzes/:quizId/reorder-questions
POST   /api/v1/admin/quizzes/:id/publish
```

Create quiz payload:

```json
{
  "slug": "mahavir-basic-quiz",
  "titleHi": "भगवान महावीर प्रश्नोत्तरी",
  "descriptionHi": "महावीर के जीवन पर दस प्रश्न।",
  "difficulty": "easy",
  "timeLimitSeconds": 300
}
```

Create question payload:

```json
{
  "questionNumber": 1,
  "questionHi": "भगवान महावीर का बचपन का नाम क्या था?",
  "options": [
    { "key": "a", "text": "वर्धमान" },
    { "key": "b", "text": "सिद्धार्थ" },
    { "key": "c", "text": "गौतम" },
    { "key": "d", "text": "पार्श्व" }
  ],
  "correctOptionKey": "a",
  "explanationHi": "वर्धमान भगवान महावीर का बचपन का नाम था।",
  "points": 1
}
```

### Categories and settings

```text
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id

GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings/:key
```

### Users and roles

```text
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id
POST   /api/v1/admin/users/:id/suspend
POST   /api/v1/admin/users/:id/restore
POST   /api/v1/admin/users/:id/reset-password
PATCH  /api/v1/admin/users/:id/role
```

Role update payload:

```json
{
  "role": "editor"
}
```

Only `super_admin` can assign `admin` or `super_admin`.

### Media

```text
POST   /api/v1/admin/media/upload-url
POST   /api/v1/admin/media/:id/complete
GET    /api/v1/admin/media
GET    /api/v1/admin/media/:id
PATCH  /api/v1/admin/media/:id
DELETE /api/v1/admin/media/:id
```

Request upload URL:

```json
{
  "type": "image",
  "fileName": "mahavir.jpg",
  "mimeType": "image/jpeg",
  "bytes": 2500000
}
```

Response:

```json
{
  "data": {
    "mediaId": "media_01",
    "uploadUrl": "https://storage.example.com/signed-put-url",
    "storageKey": "covers/2026/09/media_01.jpg",
    "expiresIn": 600
  }
}
```

The browser uploads directly to storage, then calls `complete` so the backend can verify the object and process it.

## 11. Admin Panel Screens

### Dashboard

- Published, draft, review, and archived content counts.
- New users and active readers.
- Most-read stories.
- Most-played audio.
- Quiz attempts and average scores.
- Recent audit activity.
- Failed media processing jobs.

### Content management

- Story list with search, status, category, author, and updated date filters.
- Story editor with title, slug, summary, cover, category, SEO fields, featured toggle, and status.
- Chapter editor with drag-and-drop ordering, structured text blocks, and audio attachment.
- Preview mode that renders exactly like the public story page.
- Review page showing draft versus published version.
- Publish confirmation requiring reviewer role.

### Tirthankar management

- Fixed number field from 1 to 24.
- Profile fields, symbol, introduction, teachings, cover image, related stories.
- Ordering by Tirthankar number.

### Philosophy management

- Topic editor with structured blocks and diagrams.
- Ordering controls.
- Draft preview.

### Quiz management

- Quiz editor.
- Question and option editor.
- Correct answer and explanation fields.
- Preview quiz as a reader.
- Publish validation requiring at least one question and one valid answer per question.

### Media library

- Upload image/audio/document.
- Search and filter by type.
- Audio duration and image dimensions.
- Replace media without breaking references.
- Usage count showing linked stories/chapters.
- Prevent deletion when media is still referenced, or require an explicit replacement.

### Users

- Search by name/email.
- View role, status, registration date, last login.
- Suspend/restore user.
- Change role with confirmation.
- Never show passwords or tokens.

### Audit logs

- Filter by actor, action, entity, and date.
- View before/after JSON for content changes.
- Audit logs are append-only and not editable from the panel.

## 12. Validation Rules

- All IDs must be validated as UUIDs.
- Slugs: lowercase ASCII, numbers and hyphens only, 3-120 characters.
- Hindi titles: required, trimmed, max 200 characters.
- Summaries: required, max 2,000 characters.
- Reading minutes: integer from 1 to 1,440.
- Story must have at least one published chapter before publication.
- Chapter number must be positive and unique per story.
- Tirthankar number must be an integer from 1 to 24.
- Quiz must have one or more questions.
- Each quiz question must have 2-6 unique options and one valid correct option.
- Images: allow JPEG, PNG, WebP, and AVIF; enforce a size limit.
- Audio: allow MP3, M4A, WAV, and OGG; enforce a size limit and scan metadata.
- Reject HTML/script content in plain text fields.
- Sanitize rich content according to the block schema.
- Normalize email addresses to lowercase.

## 13. Security Requirements

- Hash passwords with Argon2id or bcrypt.
- Use HTTPS in all non-local environments.
- Use HTTP-only refresh cookies.
- Add CSRF protection when cookie authentication is used.
- Rate-limit login, password reset, search, quiz submission, and upload URL endpoints.
- Lock or slow repeated failed logins.
- Validate authorization server-side on every admin mutation.
- Scan uploaded files and verify MIME type from file bytes, not only the filename.
- Use signed URLs for private media.
- Never log passwords, access tokens, refresh tokens, or signed media URLs.
- Use database transactions for publishing, deleting, reordering, and role changes.
- Add database backups and test restoration regularly.
- Keep audit logs for role changes, publishing, deletion, media changes, and settings changes.

## 14. Frontend Migration Plan

### Phase 1: API foundation

1. Add database connection and migrations.
2. Create users, categories, stories, chapters, and media tables.
3. Add seed data based on `src/data/content.ts`.
4. Add `/api/v1/stories` and `/api/v1/stories/:slug`.
5. Replace the home and story pages' static imports with API queries.

### Phase 2: Authentication and user data

1. Add register, login, logout, and current-user endpoints.
2. Add an auth provider to the frontend.
3. Replace `localStorage` bookmarks with bookmark API calls.
4. Sync reading progress to the backend when a chapter changes.
5. Keep a short local cache for offline-friendly behavior, then reconcile after login.

### Phase 3: Admin content

1. Add role and permission middleware.
2. Create admin route group under `/admin`.
3. Build story and chapter editor.
4. Add review and publishing workflow.
5. Add media library and signed uploads.

### Phase 4: Complete catalog

1. Move Tirthankars and philosophy topics to the database.
2. Move quizzes and quiz questions to the database.
3. Add search indexing.
4. Add analytics dashboard.
5. Add audit log viewer and settings.

### Phase 5: Production hardening

1. Add automated tests and end-to-end tests.
2. Add backups and restore verification.
3. Add monitoring and alerts.
4. Add CDN caching for public content and media.
5. Load-test public reads and search.

## 15. Seed Data Strategy

Create a one-time import script that maps the current frontend model:

```text
Story.slug             -> stories.slug
Story.title            -> stories.title_hi
Story.latin            -> stories.latin_title
Story.category         -> categories.name_hi, then category_id
Story.minutes          -> stories.reading_minutes
Story.summary          -> stories.summary_hi
Story.chapters[]       -> chapters
Story.related[]        -> story_relations
Story.cover            -> media reference
Story.audio            -> media metadata after real audio upload
```

Seed records should start as `draft` unless editorial review has already happened. Do not automatically publish unverified content.

## 16. Testing Checklist

### Backend unit tests

- Slug validation.
- Story and chapter validation.
- Permission checks for every role.
- Publish rules.
- Bookmark idempotency.
- Progress upsert behavior.
- Quiz scoring on the server.
- Upload type and size validation.

### API integration tests

- Register/login/logout.
- Public APIs hide drafts.
- Editor cannot publish.
- Reviewer can publish.
- Admin can manage users.
- Archived content is not returned publicly.
- Unauthorized users cannot access another user's progress.
- Duplicate slugs return `409`.

### End-to-end tests

- Reader can browse a story and save it.
- Reader can resume a chapter.
- Reader can submit a quiz.
- Editor can create a draft.
- Reviewer can approve and publish it.
- Published content appears on the public route.
- Admin can upload and attach an image/audio file.

## 17. Operational Checklist

Before production launch:

- [ ] Environment variables are configured in the deployment platform.
- [ ] Database migrations run successfully on staging.
- [ ] Initial admin account is created securely.
- [ ] Storage buckets and CDN are configured.
- [ ] Upload limits and antivirus/file validation are enabled.
- [ ] Email verification and password reset work.
- [ ] Database backups are scheduled.
- [ ] Error tracking and request IDs are enabled.
- [ ] Rate limits are enabled.
- [ ] Public pages have SEO metadata and canonical URLs.
- [ ] Privacy policy and terms are published.
- [ ] Content moderation and correction process is defined.
- [ ] Restore-from-backup test has been completed.

## 18. Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/jain_vachanalaya
AUTH_SECRET=replace-with-a-long-random-secret
APP_URL=http://localhost:8081
STORAGE_ENDPOINT=https://storage.example.com
STORAGE_BUCKET=jain-vachanalaya
STORAGE_ACCESS_KEY_ID=replace-me
STORAGE_SECRET_ACCESS_KEY=replace-me
CDN_BASE_URL=https://cdn.example.com
EMAIL_FROM=hello@example.com
EMAIL_PROVIDER_API_KEY=replace-me
SENTRY_DSN=replace-me
```

Never commit `.env` files or real credentials. Add `.env.example` with placeholder values only.

## 19. Definition of Done

The backend/admin work is complete when:

- A reader can register, log in, browse published content, save stories, track reading progress, listen to audio, and submit quizzes.
- An editor can create and edit drafts.
- A reviewer can review and publish content.
- An admin can manage users, media, settings, and audit logs.
- Public pages never expose drafts or quiz answers.
- All mutations are validated, authorized, logged, and covered by tests.
- The application can be deployed with a documented migration and rollback process.
