1. Project Overview

Build a full-stack AI-powered Email Management Application called Intelligent Email Assistant.

The application will allow users to:

Create an application account
Login/logout securely
Connect one Gmail account using Google OAuth 2.0
View Gmail inbox emails
Open individual emails
View complete email threads
Search emails
Mark emails as read/unread
Star/unstar emails
Archive emails
Delete emails
Compose emails
Reply to emails
Send emails through Gmail
Generate AI-powered email summaries
Generate AI-powered reply drafts
Edit AI-generated replies before sending
View application activity/history
Use a responsive modern dashboard
Important security principle

The application must never request or store the user's Gmail password.

Application authentication and Gmail authentication are separate:

Application Login
       ↓
Application Session
       ↓
Connect Gmail
       ↓
Google OAuth
       ↓
Gmail API Access
2. Technology Stack
Frontend
Next.js
React
Tailwind CSS
Zustand
Axios
lucide-react
Backend
Node.js
Express.js
MongoDB
Mongoose
JSON Web Token
bcryptjs
Helmet
express-validator
Morgan
Compression
express-rate-limit
Gmail Integration
Google OAuth 2.0
Gmail API
Google's official Node.js client
AI

Primary provider:

OpenRouter

Fallback provider:

Google Gemini

Architecture:

Frontend
   ↓
Backend
   ↓
AI Service
   ↓
OpenRouter
   ↓
If failure
   ↓
Gemini
Deployment

Any suitable production hosting platform may be used.

Production requirements:

HTTPS
Production MongoDB
Production environment variables
Production Google OAuth configuration
Production AI API keys
Secure cookies
3. MVP Scope
Required MVP Features
Authentication
Registration
Login
Logout
Protected routes
Secure application session
Gmail
Connect Gmail
Disconnect Gmail
Gmail connection status
Inbox
Email detail
Thread view
Search
Pagination
Email Actions
Read/unread
Star/unstar
Archive
Delete
Reply
Send
AI
Email summarization
AI reply generation
Editable AI reply
Application
Dashboard
Compose page
Search page
Activity page
Settings
Responsive UI
Error/loading/empty states
4. Bonus Features

These are NOT required for MVP.

Optional features:

AI email classification
Priority detection
Spam/phishing detection
Important-email detection
AI subject generation
Tone selection
Grammar correction
Email rewriting
Explain This Email
Action-item extraction
Deadline extraction
Calendar integration
Smart AI search
Bulk email operations
Templates
Multiple Gmail accounts
Outlook integration
Voice-to-email
Email analytics
Daily email summaries
AI inbox prioritization
Rule

Bonus features must not be implemented before all MVP requirements are completed and tested.

5. Application Authentication
Registration

Required:

name
email
password
passwordConfirmation
Validation

Name:

Required
1–100 characters
Trim whitespace

Email:

Required
Valid email format
Trim whitespace
Convert to lowercase

Password:

Minimum 8 characters
Must match confirmation

Duplicate email:

409 DUPLICATE_ACCOUNT

Passwords must be hashed using bcrypt.

Plaintext passwords must never be:

stored
returned
logged
6. Login

Request:

{
  "email": "user@example.com",
  "password": "password"
}

The system must:

Validate input.
Normalize email.
Find user.
Compare password using bcrypt.
Create authenticated session.

Invalid credentials must return a generic error.

Do not reveal:

"Email does not exist"

instead return:

Invalid credentials
7. JWT Session Strategy

JWT must be delivered using a secure cookie.

Production cookie:

HttpOnly = true
Secure = true
SameSite = Lax

Session lifetime:

24 hours

JWT payload should contain only minimal information:

{
  "sub": "userId",
  "iat": "...",
  "exp": "..."
}

Do NOT store inside JWT:

Gmail access token
Gmail refresh token
Password
AI API key
Email body
AI prompt
Encryption key
8. Zustand Security Rules

Zustand may store:

Current user
Gmail connection status
UI state
Email list state
Loading state
Error state

Zustand must never store:

JWT
Gmail access token
Gmail refresh token
Google client secret
AI API key
Encryption key
Database credentials

Browser localStorage and sessionStorage must not be used for sensitive authentication credentials.

9. Logout

When user logs out:

Server invalidates/clears session cookie.
Client clears authentication state.
User is redirected to login/landing page.

After logout, protected endpoints must reject the request.

10. Google OAuth
OAuth Flow
User clicks Connect Gmail
        ↓
Backend creates OAuth state
        ↓
Google OAuth consent
        ↓
Google redirects to callback
        ↓
Validate OAuth state
        ↓
Exchange authorization code
        ↓
Store encrypted Gmail tokens
        ↓
Mark Gmail connected
        ↓
Redirect to application
11. OAuth Security

The OAuth implementation must:

Generate cryptographically secure state
Store state server-side
Validate state
Reject missing state
Reject expired state
Reject mismatched state
Use configured redirect URI
Never accept arbitrary redirect URLs
Keep Google client secret server-side
12. Gmail OAuth Scopes

Only request scopes required for implemented Gmail functionality.

The final selected scopes must be explicitly configured through environment/configuration.

Do not request unnecessary Google permissions.

13. Gmail Token Storage

Gmail access and refresh tokens must:

Be stored server-side
Be encrypted before MongoDB storage
Never be returned to frontend
Never be placed in Zustand
Never be placed in JWT
Never be placed in URL parameters
Never be logged

Encryption key must be server-side only.

14. Gmail Token Refresh

If the access token is expired:

Request Gmail API
      ↓
Token expired
      ↓
Refresh token
      ↓
Save new access token
      ↓
Retry operation once

If refresh succeeds:

Continue normally.

If refresh fails:

GMAIL_AUTH_EXPIRED

Then:

Mark Gmail as disconnected/reconnect-required.
Ask user to reconnect Gmail.
Do not repeatedly retry the invalid refresh token.
15. Gmail Disconnect

When user disconnects Gmail:

Revoke credential where supported.
Delete/invalidate stored Gmail tokens.
Set isConnected=false.
Keep application account active.
16. One Gmail Account Rule

MVP supports:

One Gmail account per application user.

A user cannot connect multiple Gmail accounts in MVP.

Multiple Gmail accounts are a future feature.

17. Gmail Message ID vs Thread ID

This distinction must remain consistent throughout the entire application.

Message ID

Identifies one Gmail message.

Example:

messageId = 18abc123
Thread ID

Identifies an entire Gmail conversation.

Example:

threadId = 18abc456

Therefore:

/api/emails/:id

means:

:id = Gmail message ID

and:

/api/emails/:id/thread

also receives a message ID, then resolves the associated thread.

Frontend variables must use explicit names:

messageId
threadId

Avoid ambiguous names such as:

id

when handling Gmail identifiers.

18. Dashboard

Dashboard must include:

Sidebar
Inbox
Search
Gmail connection status
Compose button
Refresh
Email list
Loading skeleton
Empty state
Error state

Email list should show:

Sender
Subject
Preview
Date/time
Read/unread
Star state
19. Email Detail

Email detail must display:

Sender
Recipients
CC/BCC where available
Subject
Date/time
Email body
Attachment metadata
Thread information
Read/unread action
Star action
Archive
Delete
Reply
AI Summary
20. Thread View

Thread view must:

Retrieve Gmail thread
Display all messages
Display chronological order
Clearly separate individual messages
Show sender
Show recipient
Show timestamp
Support reply
Support AI summarization
21. Email HTML Security

Email HTML is untrusted content.

Before rendering:

Sanitize HTML
Remove <script>
Remove JavaScript event handlers
Block dangerous URL schemes
Prevent active embedded content
Never directly render raw Gmail HTML

Example:

Gmail HTML
   ↓
Sanitizer
   ↓
Safe HTML
   ↓
React UI

Plain-text fallback should be available.

22. Attachments

MVP only requires attachment metadata:

filename
mimeType
size

Attachment preview/download is not required for MVP unless explicitly added later.

23. Email Actions
Mark Read

Remove Gmail:

UNREAD
Mark Unread

Add:

UNREAD
Star

Add:

STARRED
Unstar

Remove:

STARRED
Archive

Remove:

INBOX

Archive does not delete the email.

Delete

Delete means:

Move email to Gmail Trash.

It does not mean permanent deletion.

24. Search

Endpoint:

GET /api/emails/search

Query:

q
pageToken
maxResults

Rules:

Query required
Trim whitespace
Maximum 500 characters
Empty query → 400 VALIDATION_ERROR
Use Gmail search API
Do not download entire mailbox and filter locally
Support Gmail search syntax
Use Gmail pagination
25. Pagination

Gmail endpoints use Gmail page tokens.

Request:

pageToken
maxResults

Response:

{
  "items": [],
  "nextPageToken": "...",
  "hasMore": true
}

Maximum maxResults must be controlled by backend.

Do not use offset pagination for Gmail mailbox data.

26. Email Composition

Fields:

to
cc
bcc
subject
body

Example:

{
  "to": ["user@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Hello",
  "body": "Hello, this is a message."
}

Validation:

At least one recipient
Valid email addresses
No empty recipients
Reasonable recipient limit
Subject length limit
Body size limit
27. Sending Email

Flow:

Compose
 ↓
Validate
 ↓
Verify login
 ↓
Verify Gmail connection
 ↓
Refresh Gmail token if required
 ↓
Construct MIME message
 ↓
Gmail API
 ↓
Send
 ↓
Record activity
 ↓
Return result

AI-generated messages must never automatically send.

The user must explicitly click Send.

28. AI Architecture

Frontend:

Frontend
   ↓
Backend
   ↓
aiService
   ↓
Provider Adapter
   ↓
OpenRouter

Fallback:

OpenRouter failure
       ↓
Gemini

Frontend must never directly call OpenRouter or Gemini.

29. AI Summarization

Endpoint:

POST /api/ai/summarize

Request:

{
  "messageId": "gmail-message-id"
}

or thread target according to the selected implementation contract.

The backend must:

Verify authentication.
Verify Gmail ownership.
Retrieve required Gmail content.
Extract readable content.
Limit input size.
Send only required content to AI.
Validate AI response.
Return summary.
Record activity.

Response:

{
  "success": true,
  "data": {
    "summary": "..."
  }
}
30. AI Reply Generation

Endpoint:

POST /api/ai/reply

Response:

{
  "success": true,
  "data": {
    "draft": "..."
  }
}

The generated reply:

Must be editable.
Must not be automatically sent.
Must require explicit user action to send.
31. AI Input Security

Only send necessary email/thread information to AI.

Never send:

Passwords
JWTs
OAuth tokens
API keys
Encryption keys
Unrelated emails

Maximum AI input size must be enforced server-side.

32. AI Timeout and Fallback

Use a bounded AI timeout.

Retry transient failures at most once.

If OpenRouter fails:

OpenRouter
   ↓ failure
Gemini

If both fail:

AI_PROVIDER_UNAVAILABLE

AI failure must never prevent:

Inbox access
Email reading
Manual composition
Manual sending
33. API Response Format
Success
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully."
}
Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {}
  }
}

Do not expose:

Stack traces
Passwords
Tokens
API keys
Internal secrets
34. Standard Error Codes
VALIDATION_ERROR
AUTH_REQUIRED
AUTH_INVALID
AUTH_EXPIRED
DUPLICATE_ACCOUNT
GMAIL_NOT_CONNECTED
GMAIL_AUTH_EXPIRED
GMAIL_API_ERROR
GMAIL_RATE_LIMIT
OAUTH_ERROR
OAUTH_STATE_INVALID
AI_PROVIDER_UNAVAILABLE
AI_TIMEOUT
AI_GENERATION_FAILED
RESOURCE_NOT_FOUND
INVALID_EMAIL
EMAIL_SEND_FAILED
RATE_LIMITED
INTERNAL_ERROR
35. API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
Health
GET /api/health
Gmail
GET  /api/gmail/oauth/start
GET  /api/gmail/oauth/callback
GET  /api/gmail/oauth/error
GET  /api/gmail/status
POST /api/gmail/disconnect
Emails
GET    /api/emails
GET    /api/emails/:id
GET    /api/emails/:id/thread
GET    /api/emails/search

POST   /api/emails/:id/read
POST   /api/emails/:id/unread
POST   /api/emails/:id/star
POST   /api/emails/:id/unstar
POST   /api/emails/:id/archive

DELETE /api/emails/:id

POST   /api/emails/send
POST   /api/emails/:id/reply
AI
POST /api/ai/summarize
POST /api/ai/reply
Activity
GET /api/activity
36. Database — Users
Users

Fields:

_id
name
email
password
role
createdAt
updatedAt
lastLogin

Rules:

Email unique
Email lowercase
Password select:false
Password bcrypt hashed

Index:

email UNIQUE
37. Database — GmailAccounts
GmailAccounts

Fields:

_id
owner
email
provider
isConnected
scopes
encryptedAccessToken
encryptedRefreshToken
expiresAt
createdAt
updatedAt

Rules:

One Gmail account per user
Tokens encrypted
Tokens never returned to frontend

Index:

owner UNIQUE
38. Database — EmailActivity

Fields:

_id
owner
type
status
emailId
threadId
message
metadata
createdAt

Record activities such as:

Gmail connected
Gmail disconnected
Email sent
Email deleted
Email archived
AI summary
AI reply
Authentication events
Important failures

Never store:

Password
JWT
OAuth token
API key
Encryption key
Complete email body unnecessarily

Indexes:

owner + createdAt
owner + emailId + createdAt
39. Database — AISessions

Fields:

_id
owner
operation
emailId
threadId
provider
status
createdAt

Operations:

summarize
generate_reply

Do not store complete email bodies or complete AI prompts by default.

40. Authorization

Every resource must enforce ownership.

A user must never access another user's:

Gmail account
Activity
AI session
Application profile

Never trust a client-provided:

ownerId
userId

for authorization.

Use authenticated server-side identity.

41. Security Requirements

The application must use:

bcrypt
HttpOnly cookies
Secure cookies
HTTPS
Helmet
CORS restrictions
Input validation
Rate limiting
OAuth state validation
HTML sanitization
Encrypted Gmail tokens
Environment variables
Secure error handling

Protection required against:

XSS
NoSQL injection
CSRF where applicable
Credential theft
Token exposure
OAuth attacks
Excessive API requests
42. CORS

Production backend must allow only configured frontend origin(s).

Do not use:

Access-Control-Allow-Origin: *

with authenticated credentials.

43. Rate Limiting

Rate limiting must be applied especially to:

/register
/login
OAuth endpoints
AI endpoints
send email

Exact production limits may be configured based on expected usage.

44. Frontend Pages
/

Landing page.

/login

Login.

/register

Registration.

/dashboard

Inbox dashboard.

/emails/[id]

Email/thread detail.

/compose

Compose email.

/search

Search results.

/integrations

Gmail connection.

/activity

Activity history.

/settings

Account/settings.

45. UI/UX

Application should have a modern email-client design.

Requirements:

Responsive
Desktop support
Tablet support
Mobile support
Loading skeletons
Empty states
Error states
Success notifications
Clear Gmail connection status
Unread visual distinction
AI content visual distinction
Editable AI responses
Explicit Send button

Never display technical stack traces to users.

46. Frontend Architecture

Recommended Next.js Pages Router structure:

client/
├── pages/
│   ├── _app.js
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── dashboard.js
│   ├── compose.js
│   ├── search.js
│   ├── integrations.js
│   ├── activity.js
│   ├── settings.js
│   └── emails/
│       └── [id].js
│
├── src/
│   ├── components/
│   ├── store/
│   ├── services/
│   └── utils/
│
├── public/
└── package.json
47. Backend Architecture
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── google.js
    │
    ├── routes/
    ├── controllers/
    ├── services/
    ├── integrations/
    │   └── gmailIntegration.js
    ├── middleware/
    ├── models/
    └── utils/
Responsibilities

Routes:

Routing
Middleware

Controllers:

Request parsing
Response formatting

Services:

Business logic

Integrations:

Gmail API
AI providers

Models:

MongoDB/Mongoose

Middleware:

Authentication
Validation
Rate limiting
Error handling
Security
48. Environment Variables
Client-safe
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_APP_URL
Server-only
MONGODB_URI
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_OAUTH_SCOPES
OPENROUTER_API_KEY
GEMINI_API_KEY
TOKEN_ENCRYPTION_KEY
CLIENT_URL
NODE_ENV
PORT

Rules:

Never expose server-only secrets.
Never commit .env.
Provide .env.example.
Rotate compromised secrets.
49. Health Check

Endpoint:

GET /api/health

Response:

{
  "success": true,
  "data": {
    "status": "ok"
  }
}

Never expose:

database credentials
API keys
connection strings
encryption keys
50. Deployment Requirements

Production must have:

HTTPS frontend
HTTPS backend
MongoDB
Environment variables
Correct CORS
Correct API URL
Correct Google OAuth redirect
AI API keys
Token encryption key
Production build
Production startup command
Health check
Safe logging

Any suitable cloud provider may be used.

51. Backup and Recovery

MVP should use the selected MongoDB provider's backup functionality where available.

Backups must not expose:

Encryption keys
Credentials
API keys

The application must not rely on MongoDB as a backup of the user's Gmail mailbox.

52. Non-Functional Requirements
Performance

Normal application APIs should generally respond within approximately:

2 seconds

when dependent services respond normally.

External Gmail/AI latency may exceed this.

The UI must always show appropriate loading states.

Reliability

External failures must not crash the application.

AI failure must not prevent normal email usage.

Gmail token failure must produce reconnect behavior.

Send failures must preserve the user's composed content.

Accessibility
Keyboard navigation
Accessible labels
Visible focus
Do not rely only on color for state
53. Testing
Unit Testing

Test:

Registration
Login
Password hashing
JWT/session
OAuth state
Gmail token refresh
Gmail service
MIME parsing
AI service
AI response validation
Activity
Recipient validation
Error handling
54. Integration/API Testing

Test:

Register
Login
Logout
Protected routes
Gmail status
OAuth
Inbox
Email detail
Thread
Search
Read
Unread
Star
Unstar
Archive
Delete
AI summary
AI reply
Send
Reply
Activity
55. Security Testing

Test:

Unauthenticated access
Expired sessions
Cross-user access
Invalid input
NoSQL injection
XSS
Rate limiting
OAuth state mismatch
Token exposure
Sensitive logs
CORS
CSRF protection
56. AI Testing

Test:

Success
Valid provider response
Failure
Provider timeout
Malformed response
Primary provider failure
Fallback success
Both providers fail
Oversized input
Empty AI response
57. End-to-End Test

The complete happy path must work:

Register
   ↓
Login
   ↓
Connect Gmail
   ↓
OAuth
   ↓
Inbox
   ↓
Open Email
   ↓
Open Thread
   ↓
Generate Summary
   ↓
Generate Reply
   ↓
Edit Reply
   ↓
Send
   ↓
Verify Gmail
   ↓
Verify Activity
58. Acceptance Criteria
Registration

Given valid registration information
When the user registers
Then the account is created and the password is securely hashed.

Login

Given valid credentials
When the user logs in
Then an authenticated session is created.

Gmail

Given an authenticated user
When Gmail OAuth succeeds
Then Gmail becomes connected.

Inbox

Given Gmail is connected
When dashboard opens
Then paginated Gmail messages appear.

Email

Given a valid Gmail message ID
When user opens it
Then sanitized email content appears.

Thread

Given an email belonging to a thread
When thread is opened
Then all accessible thread messages appear chronologically.

Search

Given a valid query
When user searches
Then Gmail search results appear with pagination.

Read/Unread

When user changes read state
Then Gmail label state changes accordingly.

Star

When user stars/un-stars
Then Gmail star state changes.

Archive

When user archives
Then Inbox label is removed.

Delete

When user deletes
Then email moves to Gmail Trash.

AI Summary

When user requests summary
Then a summary is generated without sending/modifying the email.

AI Reply

When user requests reply
Then an editable draft is generated.

Send

When user explicitly clicks Send
Then Gmail sends the message.

Activity

When important operations occur
Then safe activity records are created.

59. Development Phases
Phase 1 — Setup & Authentication
Frontend setup
Backend setup
MongoDB
Environment configuration
Registration
Login
Logout
JWT/session
Protected routes
Zustand
AppShell
Phase 1 must be tested before Phase 2.
Phase 2 — Gmail OAuth
Google OAuth
OAuth state
Callback
Token encryption
Token refresh
Gmail status
Disconnect
OAuth error handling
Phase 2 must be tested before Phase 3.
Phase 3 — Email Dashboard
Inbox
Email list
Email detail
Thread
Search
Pagination
Read/unread
Star/unstar
Archive
Delete
HTML sanitization
Phase 4 — Composition
Compose
Validation
MIME construction
Send
Reply
Delivery verification
Phase 5 — AI
AI abstraction
OpenRouter
Gemini fallback
Summarization
Reply generation
Editable replies
Timeout
Retry
Fallback
Phase 6 — Finalization
Activity
Security
Rate limiting
Testing
E2E
Production OAuth
Deployment
Health check
Production verification
60. AI Coding Agent Rules

The coding agent must:

Read the entire specification before coding.
Follow phases sequentially.
Never implement everything in one uncontrolled generation.
Preserve architecture.
Keep controllers thin.
Put business logic in services.
Keep Gmail logic behind Gmail integration/service.
Keep AI logic behind aiService.
Never access MongoDB directly from controllers.
Never call Gmail API directly from React components.
Never expose secrets.
Encrypt OAuth tokens.
Never log credentials.
Validate all inputs.
Use consistent API responses.
Implement explicit error handling.
Implement provider fallback.
Test every phase.
Report files created/modified.
Report known limitations.
Do not silently skip requirements.
Do not implement bonus features before MVP is verified.
61. Final Project Architecture
                    ┌─────────────────────┐
                    │      Next.js UI     │
                    │ React + Tailwind    │
                    │ Zustand + Axios     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Express API     │
                    │ Auth + Validation   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
       │   MongoDB   │  │ Gmail Service│  │  AI Service  │
       │  Mongoose   │  │ Gmail API    │  │ OpenRouter   │
       └─────────────┘  └──────┬───────┘  │ → Gemini     │
                               │          └──────────────┘
                               ▼
                         Google OAuth
62. Final Readiness Verdict
🟢 READY FOR IMPLEMENTATION

The specification is now:

Complete
Clear
Implementable
Secure
Testable
Deployable
Realistic

The only decisions that need to be finalized during project configuration are:

Production hosting provider.
Production frontend/backend URLs.
Exact approved Gmail OAuth scopes.
Exact AI model IDs.
Final rate-limit values.
MongoDB hosting/backup configuration.

These are configuration decisions, not specification gaps.

Final rule for development

MVP first → test → secure → integrate AI → test again → deploy → only then consider bonus features.