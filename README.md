# Lead Generation CRM

A full-featured lead management system — track leads, manage your sales pipeline, generate AI-powered WhatsApp messages, and monitor business performance from a single dashboard.

---

## Features

- **Multi-User Auth** — Anyone can sign up and create their own account
- **Persistent Sessions** — Login survives browser closes and system restarts (1-year cookie); only logs out when you click Logout
- **Lead Management** — Add, edit, delete, and filter leads by status
- **Pipeline Tracking** — Stages from New Lead → Successfully Closed
- **Dashboard Analytics** — Total leads, order value, conversion rate, recent activity
- **AI Message Generator** — Gemini-powered WhatsApp message drafts per lead
- **Profile-Aware UI** — Avatar, name, and email in the sidebar/header are pulled from your account
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Turso (libSQL / SQLite) |
| AI | Google Gemini API |
| Auth | JWT via `jose` + HTTP-only cookies |
| Passwords | `bcryptjs` (bcrypt hashing) |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ridhamxdev/crm-for-lead-generation.git
cd crm-for-lead-generation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Turso (cloud SQLite)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Auth — JWT secret (use a long random string)
JWT_SECRET=your-random-secret-key-min-32-chars

# Optional — Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

> **Note:** In development without `TURSO_DATABASE_URL`, the app falls back to a local SQLite file at `data/crm.db`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the public landing page.

---

## Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with feature overview |
| `/register` | Public (redirects if logged in) | Create a new account |
| `/login` | Public (redirects if logged in) | Sign in to existing account |
| `/dashboard` | **Auth required** | Main CRM app (dashboard + leads) |
| `/api/auth/register` | Public | POST — create account |
| `/api/auth/login` | Public | POST — sign in |
| `/api/auth/logout` | Auth | POST — sign out |
| `/api/auth/me` | Auth | GET — current user info |
| `/api/leads` | Auth | GET / POST leads |
| `/api/leads/[id]` | Auth | GET / PATCH / DELETE lead |
| `/api/ai/generate-message` | Auth | POST — AI WhatsApp message |

---

## Authentication

- **Sign up** at `/register` — name, email, password (min 6 chars). Passwords are hashed with bcrypt.
- **Login** at `/login` — email + password.
- On success, an **HTTP-only JWT cookie** is set with a **1-year `maxAge`** — it persists on disk across browser closes and system restarts.
- The session ends **only** when you click the Logout button (↪) in the header.
- If you're already logged in, visiting `/login` or `/register` automatically redirects you to `/dashboard`.
- All `/dashboard` and `/api/*` routes (except auth routes) are protected by Next.js middleware.

### Changing JWT Secret

Update `JWT_SECRET` in `.env.local` and restart the server. All existing sessions will be invalidated automatically.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Public landing page
│   ├── layout.tsx                # Root layout
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Register page
│   ├── dashboard/page.tsx        # Main CRM app (protected)
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── leads/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── ai/generate-message/route.ts
├── components/
│   ├── dashboard/Dashboard.tsx
│   ├── layout/
│   │   ├── Header.tsx            # Shows user initials from session
│   │   ├── Sidebar.tsx           # Shows user name/email from session
│   │   └── MobileNav.tsx
│   ├── leads/
│   │   ├── LeadsView.tsx
│   │   ├── LeadTable.tsx
│   │   ├── LeadCard.tsx
│   │   ├── LeadFormModal.tsx
│   │   └── WhatsAppModal.tsx
│   └── ui/
│       ├── Modal.tsx
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── auth.ts                   # JWT sign/verify helpers
│   ├── useUser.ts                # Client hook for current user
│   ├── db.ts                     # Turso/SQLite client + schema init
│   ├── gemini.ts                 # Gemini AI client
│   └── utils.ts                  # Formatting helpers
├── middleware.ts                  # Route protection
└── types/index.ts                 # Shared TypeScript types
```

---

## Lead Statuses

| Status | Label |
|--------|-------|
| `new` | New Lead |
| `follow_up` | Follow Up |
| `orders_convert` | Orders Convert |
| `design_phase` | Design Phase |
| `hold_order` | Hold Order |
| `payment_50` | 50% Payment Done |
| `order_complete` | Order Complete |
| `closed` | Successfully Closed |
| `rejected` | Rejected |

---

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Add all environment variables (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`, `GEMINI_API_KEY`) in the Vercel dashboard.
4. Deploy.

---

## License

MIT License — Copyright &copy; 2026 [ridhamxdev](https://github.com/ridhamxdev)
