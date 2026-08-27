# Intelligent Email Assistant

> A full-stack, AI-powered Gmail management application built with **Node.js**, **Next.js**, and **Google OAuth 2.0**.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

---

## Features

### Authentication
- Secure account registration and login using **JWT** stored in **HttpOnly cookies**
- Passwords hashed with **bcrypt** (cost factor 12)
- Protected routes on both frontend and backend
- Automatic session expiry and re-authentication flow

### Gmail Integration
- Connect your Gmail account via **Google OAuth 2.0**
- View and navigate your inbox with a split-pane layout (email list + detail)
- **Search** emails using Gmail's full query syntax
- **Star / Unstar** emails
- **Mark as read / unread**
- **Archive** emails
- **Delete** (move to Trash)
- View **email threads**
- Images blocked by default for privacy, with a manual "Show images" option
- Gmail tokens encrypted at rest with **AES-256-GCM**

### Compose & Reply
- Write and send new emails with **To**, **CC**, and **BCC** support
- Send threaded **replies** to existing emails
- AI-assisted compose (see below)

### AI Features (Gemini 2.5 Flash — Primary | OpenRouter — Fallback)

#### Email Summarization
- One-click **AI summary** of any email in the inbox
- Concise 2–4 sentence factual summaries
- Identifies sender intent, key information, deadlines, and action items
- Summary can be copied to clipboard

#### AI Reply Draft
- One-click **AI-generated reply draft** based on the email content
- Optional custom instructions (e.g. "keep it brief", "be formal")
- **Direct Send Reply button** — sends the AI draft as a reply immediately without copy-pasting
- Draft can also be copied to clipboard
- Regenerate the draft as many times as needed

#### AI Email Compose
- On the Compose page, describe what you want to write in plain language
- AI automatically generates a complete **subject line and email body**
- Review and edit the generated content before sending
- Collapse/expand the AI panel as needed
- Regenerate with a new description anytime

#### AI Email Classification
- Classifies each email into one of 8 categories: **Work, Finance, Travel, Promotions, Social, Updates, Personal, Other**
- Shows category badge with a one-sentence explanation
- Helps you instantly understand what type of email you are looking at

#### AI-Powered Inbox Prioritization
- Assigns a priority level — **High / Normal / Low** — to any email
- Based on urgency, deadlines, and whether a reply is required
- Color-coded priority badges: red (High), amber (Normal), grey (Low)
- Includes a short reason explaining the priority decision

#### Extract Action Items & Deadlines
- Scans the email and extracts a list of **specific tasks the recipient needs to do**
- Each action item includes the task description, deadline (if mentioned), and urgency level
- Urgency color-coded: red dot (high), amber dot (normal), grey dot (low)
- If no action items are found, clearly states "No action items found"

### Activity Log
- Full paginated audit trail of all actions: email operations and AI usage
- Tracks status (success / failure) for every action

### Security
| Concern | Implementation |
|---------|----------------|
| Passwords | bcrypt with cost factor 12 |
| Session tokens | HttpOnly + Secure + SameSite=Lax cookies |
| Gmail tokens | AES-256-GCM encrypted at rest; never returned in API responses |
| OAuth state | 32-byte cryptographically random; 10-minute TTL; single-use |
| XSS | DOMPurify with strict allowlist before rendering email HTML |
| Rate limiting | Registration: 5/hr · Login: 10/min · AI: 10/min · Send: 20/hr |
| Input validation | express-validator on all mutation endpoints |
| CORS | Origin-restricted to `CLIENT_URL` |
| Security headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |

---

## Tech Stack

### Backend (Node.js / Express)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT in HttpOnly cookies, bcrypt (cost 12)
- **Gmail**: Google APIs Node.js Client (`googleapis`)
- **AI Primary**: Google Gemini 2.5 Flash (via REST v1)
- **AI Fallback**: OpenRouter (nvidia/nemotron-3.5-lightning:free)
- **Security**: Helmet, CORS, express-rate-limit, express-validator, AES-256-GCM
- **Logging**: Custom logger with structured output

### Frontend (Next.js)
- **Framework**: Next.js 16 (Pages Router) with Turbopack
- **State**: Zustand
- **HTTP**: Axios (withCredentials)
- **Styling**: Tailwind CSS + custom CSS design tokens
- **Icons**: Lucide React
- **Sanitization**: isomorphic-dompurify (email HTML rendering)

---

## Project Structure

```
Email Assistant/
├── server.js               <- Entry point
├── app.js                  <- Express app (middleware + routes)
├── .env                    <- Server environment (DO NOT COMMIT)
├── .env.example            <- Template — copy this to .env
|
├── src/
|   ├── config/             <- env.js, db.js, ai.js (prompts + models), google OAuth client
|   ├── models/             <- User, GmailAccount, EmailActivity, AISession
|   ├── middleware/         <- authenticate, errorHandler, rateLimiter, validate, requireGmail
|   ├── services/           <- authService, gmailService, emailService, sendService, aiService, activityService
|   ├── integrations/       <- gmailIntegration (Gmail API), aiIntegration (Gemini/OpenRouter)
|   ├── controllers/        <- auth, gmail, email, send, ai, activity
|   ├── routes/             <- auth, gmail, email, ai, activity, health
|   └── utils/              <- logger, crypto (AES-256-GCM), oauthState
|
└── client/                 <- Next.js frontend
    ├── pages/              <- index, login, register, dashboard, search, compose, activity, integrations, settings, emails/[id]
    ├── components/
    |   ├── layout/         <- AppShell (sidebar + mobile nav)
    |   ├── ui/             <- Button, Input, Spinner, ToastContainer
    |   ├── auth/           <- ProtectedRoute
    |   └── email/          <- EmailList, EmailDetail, AIPanel
    ├── store/              <- authStore, gmailStore, emailStore, uiStore (Zustand)
    ├── services/           <- api.js (Axios singleton)
    └── utils/              <- validators, sanitize, formatDate
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google Cloud** project with Gmail API enabled
- **Google Gemini API key** (free from [Google AI Studio](https://aistudio.google.com))
- **OpenRouter API key** (optional free fallback from [openrouter.ai](https://openrouter.ai))

---

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd "Email Assistant"
npm install

# Install client dependencies
cd client
npm install
cd ..
```

---

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

Open `.env` and set the following:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/email-assistant

# JWT Secret (generate with command below)
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# CORS
CLIENT_URL=http://localhost:3000

# Google OAuth (see Google OAuth Setup below)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/oauth/callback
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify

# Token Encryption (generate with command below)
TOKEN_ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# AI Keys
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key   # optional fallback
```

**Generate secrets:**
```bash
# JWT_SECRET (64-byte hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# TOKEN_ENCRYPTION_KEY (32-byte hex for AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Library** > Search for **Gmail API** > Enable it
4. Go to **APIs & Services > OAuth consent screen**:
   - Choose **External**
   - Add your Gmail address under **Test users**
5. Go to **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**
   - **Application type**: Web application
   - **Authorized redirect URIs**: `http://localhost:5000/api/gmail/oauth/callback`
6. Copy the **Client ID** and **Client Secret** into your `.env`

---

### 4. AI Setup

The app uses **Google Gemini 2.5 Flash** as primary and **OpenRouter** as fallback.

**Google Gemini (primary — required for AI features):**
- Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Copy your API key to `GEMINI_API_KEY`

**OpenRouter (optional fallback):**
- Sign up at [openrouter.ai](https://openrouter.ai)
- Create an API key and copy it to `OPENROUTER_API_KEY`
- Free models are used automatically (no billing required)

> If neither AI key is configured, all email and auth features still work normally. Only AI-specific features will be unavailable.

---

### 5. Run the Application

**Start the backend** (Terminal 1):
```bash
cd "Email Assistant"
npm run dev
# API running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Start the frontend** (Terminal 2):
```bash
cd "Email Assistant/client"
npm run dev
# App running at http://localhost:3000
```

Open your browser at **http://localhost:3000**.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/register` | Create account |
| `/login` | Sign in |
| `/dashboard` | Inbox — split-pane email list + detail view |
| `/search` | Gmail search with results pane |
| `/compose` | Write new email with AI generation support |
| `/integrations` | Connect / disconnect Gmail account |
| `/activity` | Paginated action history |
| `/settings` | Account profile |
| `/emails/[id]` | Direct email permalink |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Current user profile |

### Gmail OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gmail/oauth/start` | Begin OAuth flow |
| `GET` | `/api/gmail/oauth/callback` | OAuth redirect handler |
| `GET` | `/api/gmail/status` | Connection status |
| `POST` | `/api/gmail/disconnect` | Revoke & disconnect |

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/emails` | List inbox |
| `GET` | `/api/emails/search?q=...` | Search emails |
| `GET` | `/api/emails/:id` | Get full email |
| `GET` | `/api/emails/:id/thread` | Get thread |
| `POST` | `/api/emails/:id/read` | Mark as read |
| `POST` | `/api/emails/:id/unread` | Mark as unread |
| `POST` | `/api/emails/:id/star` | Star email |
| `POST` | `/api/emails/:id/unstar` | Unstar email |
| `POST` | `/api/emails/:id/archive` | Archive |
| `DELETE` | `/api/emails/:id` | Move to Trash |
| `POST` | `/api/emails/send` | Send new email |
| `POST` | `/api/emails/:id/reply` | Send reply to email |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/summarize/:id` | Generate email summary |
| `POST` | `/api/ai/reply/:id` | Generate AI reply draft |
| `POST` | `/api/ai/generate` | Generate email from description (compose) |
| `POST` | `/api/ai/classify/:id` | Classify email into category |
| `POST` | `/api/ai/prioritize/:id` | Assign priority level (High/Normal/Low) |
| `POST` | `/api/ai/extract-actions/:id` | Extract action items and deadlines |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/activity` | Activity log (paginated) |

---

## Scripts

### Server
```bash
npm start       # Production start
npm run dev     # Development with nodemon (auto-reload)
```

### Client
```bash
npm run dev     # Development server (port 3000)
npm run build   # Production build
npm start       # Serve production build
```

---

## Known Notes

- **AI provider**: Gemini 2.5 Flash is the current primary model (upgraded from deprecated gemini-1.5-flash-latest). OpenRouter serves as automatic fallback.
- **DNS**: The backend sets `dns.setServers(['8.8.8.8', '1.1.1.1'])` to ensure MongoDB Atlas SRV records resolve correctly on Windows.
- **Gmail OAuth test mode**: While your Google app is in Testing status, only emails listed under Test Users in Google Cloud Console can connect Gmail.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Follow the existing service/controller/route architecture
4. Never commit `.env` files or real credentials
5. Open a pull request

---

## License

ISC (c) 2024 Intelligent Email Assistant
