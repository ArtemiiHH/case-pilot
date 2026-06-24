# CasePilot

**CasePilot** is a lightweight case management tool built for law firms and solo practitioners. It gives lawyers a clean, no-friction way to manage client cases, track progress through each stage, and keep clients informed — all from one place.

---

## Features

### For Lawyers

- **Case Dashboard** — View all cases at a glance in a sortable table showing client name, case type, current stage, and last updated time.
- **Add Cases** — Create a new case by entering the client's name, email, case type, and starting stage.
- **Case Stages** — Move a case through predefined stages: Case Opened, Documents Requested, Documents Received, Under Review, In Progress, and Resolved / Closed.
- **Send Updates** — From inside a case, select a new stage and optionally add a short note (up to 300 characters), then send the update to the client in one click.
- **Update History** — Every stage change and note is logged with a timestamp, giving a full audit trail of the case.
- **Client Tracking Link** — Each case has a unique shareable link that can be copied and sent to the client directly.
- **Company Settings** — Configure firm details (name, logo, contact info) in the Settings page. These details appear on all client-facing emails and documents.

### For Clients

- **Email Notifications** — Clients receive an automated email each time their lawyer sends a stage update, including any note and the firm's branding.
- **Live Case Tracking** — Using the unique tracking link, clients can view the current status of their case and the full update history in real time — no login required.

---

## Case Stages

| Stage | Description |
|---|---|
| Case Opened | The case has been created and is now active |
| Documents Requested | The lawyer has requested documents from the client |
| Documents Received | Client documents have been received |
| Under Review | The case materials are being reviewed |
| In Progress | Active legal work is underway |
| Resolved / Closed | The case has been concluded |

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A package manager: npm, yarn, or pnpm

### Installation

```bash
git clone https://github.com/your-org/casepilot.git
cd casepilot
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the root of the project. At minimum you will need:

```
# Email delivery (e.g. Resend, SendGrid, Nodemailer)
EMAIL_API_KEY=your_key_here
EMAIL_FROM=noreply@yourfirm.com

# App base URL (used to generate client tracking links)
VITE_APP_URL=http://localhost:5173
```

---

## Project Structure

```
casepilot/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx       # All cases list view
│   │   ├── AddCase.jsx         # New case form
│   │   ├── CaseDetail.jsx      # Individual case view with update panel
│   │   └── Settings.jsx        # Firm settings
│   ├── components/             # Shared UI components
│   └── main.jsx
├── public/
└── README.md
```

---

## Roadmap

- [ ] Client portal with login
- [ ] Document uploads per case
- [ ] SMS notifications in addition to email
- [ ] Search and filter on the dashboard
- [ ] Role-based access (paralegal, associate, partner)
- [ ] Multi-firm / SaaS mode

---

## License

MIT
