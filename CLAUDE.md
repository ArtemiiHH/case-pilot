# CLAUDE.md — Legal Case Update MVP

## What This Is
A SaaS tool for law firms to keep clients informed about case progress. Lawyer logs in, creates a case, advances it through stages with one click. Client gets an email and views a branded tracking page via unique link — no login, no app required.

**Core principle:** Every lawyer interaction should cost less effort than sending a WhatsApp message.

---

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), CSS Modules |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | Passport.js (passport-local) + bcrypt + express-session + connect-pg-simple |
| Email | Resend |
| File Storage | Local via multer |

---

## Project Structure
```
/client/src
  /pages       # Login, Dashboard, AddCase, CaseDetail, ClientTracking, Settings
  /components  # Shared UI
  /styles      # CSS Modules — one file per page/component
  /lib         # API calls, stages constant, helpers
/server
  /routes      # auth.js, cases.js, firms.js
  /middleware  # requireAuth.js
  /lib         # prisma.js, email.js, tokens.js
  /uploads     # Local logo storage
  /prisma/schema.prisma
```

---

## Database Schema
```prisma
model Firm {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String?
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  cases     Case[]
}
model Case {
  id          String   @id @default(cuid())
  clientName  String
  clientEmail String
  caseType    String
  stage       String   @default("Case Opened")
  token       String   @unique
  firmId      String
  firm        Firm     @relation(fields: [firmId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  updates     Update[]
}
model Update {
  id        String   @id @default(cuid())
  stage     String
  note      String?
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## Auth
Passport.js `passport-local`. Sessions stored in Postgres via `connect-pg-simple`. One login per firm, no roles. `requireAuth` middleware on all protected routes. `/api/case/:token` is fully public.

---

## Pages (6 total)

**Login** — Email + password only. No sign-up (manual onboarding). Redirect to `/dashboard` on success.

**Dashboard** — Case list. Each row: client name, case type, stage pill (colour-coded), last updated (relative). Cases stale 7+ days get muted styling. "Add Case" button top right. Empty state with CTA.

**Add Case** — Client first/last name, email, case type (dropdown), starting stage (dropdown). On submit: create case + token, send Email 1, redirect to case detail.

**Case Detail** — Current stage (large pill). Stage dropdown + optional note textarea (300 char max) + "Send Update" button. Copyable client link. Full update timeline below (newest first).

**Client Tracking `/case/:token`** — Public. Firm logo, "Case Update for [First Name]", current stage bold + large, visual step bar across all 8 stages, last updated, note if present, update history. Mobile-first. No login prompt.

**Settings** — Firm name, logo upload (PNG/JPG max 2MB), change password. Separate save per section.

---

## Stages — `/client/src/lib/stages.js`
```js
export const STAGES = [
  { label: 'Case Opened',                  color: 'blue'   },
  { label: 'Documents Requested',          color: 'amber'  },
  { label: 'Documents Received',           color: 'amber'  },
  { label: 'Under Review',                 color: 'purple' },
  { label: 'Awaiting Court Date / Filing', color: 'orange' },
  { label: 'In Progress',                  color: 'blue'   },
  { label: 'Awaiting Decision / Outcome',  color: 'orange' },
  { label: 'Resolved / Closed',            color: 'green'  },
]
```

---

## Emails (Resend — 2 only)
**Email 1 — Case Created:** On case creation. Subject: `Your case has been registered — [Firm Name]`. Link to tracking page. From display name = firm name. No product branding in body.

**Email 2 — Case Updated:** On every lawyer update. Subject: `Update on your case — [Firm Name]`. New stage + optional note + link. No product branding in body.

---

## API Routes
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/cases` | Yes | List cases |
| POST | `/api/cases` | Yes | Create case |
| GET | `/api/cases/:id` | Yes | Case + updates |
| PATCH | `/api/cases/:id` | Yes | Send update |
| GET | `/api/case/:token` | No | Public client view |
| PATCH | `/api/firms/settings` | Yes | Name + logo |
| PATCH | `/api/firms/password` | Yes | Password change |

Always verify `req.user.firmId` matches the resource. Never trust client-sent firmId.

---

## UI Rules
White background, clean sans-serif, generous whitespace. No modals — inline errors and toasts only. Relative timestamps everywhere. Empty states always have a CTA. All pages mobile-responsive.

## Do Not Build in v1
Client login, document uploads, messaging, multi-user, custom stages, billing, integrations, analytics, forgot password, self-serve signup, mobile app.

## Build Order
1. Prisma schema + DB  2. Passport auth  3. Dashboard (read)  4. Add Case + token
5. Case Detail (read)  6. Send Update  7. Client Tracking page  8. Emails
9. Settings  10. Polish (colours, timestamps, empty states, mobile)
