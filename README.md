# LeadMarket — Freelancer-Client Lead Marketplace

LeadMarket is a full-stack marketplace web application connecting clients with freelancers through high-quality project leads. Freelancers subscribe to tiers to browse and lock/claim leads, while clients and admins publish opportunities.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS v3, React Router v6, Lucide Icons, Recharts
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL (recommended & configured)
- **Authentication**: JWT-based stateless auth with role-based middleware guards
- **Payments**: Razorpay integration placeholder with extensible modular service

### Why PostgreSQL?
- **Relational Data Integrity**: The domain naturally models foreign-key relationships: `Users` (roles) -> `Subscriptions`, `Users` -> `Leads` (posted by / claimed by), `Categories` -> `Leads`.
- **Atomic Locking & Race-Condition Safety**: When multiple freelancers attempt to claim the same lead simultaneously, PostgreSQL's row-level locking (`SELECT ... FOR UPDATE` via `sequelize.transaction`) guarantees exactly one freelancer wins the claim without double-assignment.
- **Structured Filtering**: Rich multi-attribute querying across categories, budget ranges, date ranges, and statuses.

---

## 👥 User Roles & Seed Credentials

| Role | Email | Password | Access Route | Description |
|---|---|---|---|---|
| **Admin** | `admin@leadmarket.com` | `admin123` | `/admin/login` | Full control panel (not linked publicly in navbar) |
| **Freelancer** | `freelancer@test.com` | `test123` | `/login` | Signs up, subscribes, browses/claims leads |
| **Client** | `client@test.com` | `test123` | `/login` | Signs up, posts leads directly, monitors status |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** installed and running (default port `5432`)
- Create database `leadmarket`:
  ```sql
  CREATE DATABASE leadmarket;
  ```

### 2. Backend Setup
```bash
cd backend

# Install dependencies (already installed if using this repo)
npm install

# Configure environment variables
# Copy .env.example to .env (already created)
# Update DATABASE_URL with your PostgreSQL credentials:
# postgresql://<username>:<password>@localhost:5432/leadmarket

# Run database migration & seed dummy categories and leads
npm run seed

# Start the development API server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📂 Project Structure

```
leadmarket/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Sequelize connection & config
│   │   ├── controllers/
│   │   │   ├── adminController.js   # Admin CRUD, approvals, stats
│   │   │   ├── authController.js    # Login, signup, admin login, me
│   │   │   ├── clientController.js  # Client lead creation & tracking
│   │   │   ├── leadController.js    # Lead browsing & atomic claim logic
│   │   │   └── subscriptionController.js # Tier subscriptions
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT bearer token verification
│   │   │   ├── roleGuard.js         # Role authorization (admin, freelancer, client)
│   │   │   └── subscriptionCheck.js # Enforces active plan & claim limits
│   │   ├── models/
│   │   │   ├── Category.js          # Category schema
│   │   │   ├── Lead.js              # Lead model with foreign keys & status enum
│   │   │   ├── Subscription.js      # User subscription tier & claim counter
│   │   │   ├── User.js              # User model with role enum
│   │   │   └── index.js             # Relational associations
│   │   ├── routes/                  # Modular route mounting
│   │   ├── services/
│   │   │   ├── notificationService.js # Extensible email/SMS notification stub
│   │   │   └── paymentService.js    # Razorpay checkout & signature verification
│   │   ├── app.js                   # Express server entry point
│   │   └── seed.js                  # Database seeder (users, categories, 15 leads)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/               # LeadForm, CategoryForm
│   │   │   ├── layout/              # Navbar, Sidebar, DashboardLayout
│   │   │   └── shared/              # LeadCard, DataTable, Modal, StatsCard, etc.
│   │   ├── context/                 # AuthContext (JWT auth state & role router)
│   │   ├── hooks/                   # useAuth, useApi
│   │   ├── pages/
│   │   │   ├── admin/               # Dashboard (charts), ManageLeads, Categories, Users
│   │   │   ├── auth/                # Login, ClientSignup, FreelancerSignup, AdminLogin
│   │   │   ├── client/              # Dashboard, PostLead, MyLeads
│   │   │   └── freelancer/          # Dashboard, BrowseLeads, LeadDetail, MyLeads, Plans
│   │   ├── services/                # Axios API service layer (auth, leads, admin, subs)
│   │   ├── App.jsx                  # React Router configuration with ProtectedRoute
│   │   └── main.jsx                 # Vite root
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔑 Key Features & Mechanics

### 1. Atomic "Claim" Mechanic (Race-Condition Proof)
- Leads follow the lifecycle: `pending` -> `open` -> `claimed` -> `closed`.
- When a freelancer clicks **Claim Lead**:
  ```javascript
  await sequelize.transaction(async (t) => {
    const lead = await Lead.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (lead.status !== 'open') throw new Error('Lead is no longer available');
    lead.status = 'claimed';
    lead.claimedBy = freelancerId;
    lead.claimedAt = new Date();
    await lead.save({ transaction: t });
  });
  ```
- Locked leads immediately vanish from the public browse pool and display under the freelancer's **My Leads** page.

### 2. Subscription Gating
- Unsubscribed freelancers can browse leads and view categories/budget previews.
- Lead descriptions, client contacts, and claim buttons are **blurred/locked** behind a subscription gate.
- Includes **Basic** (10 claims/month) and **Pro** (Unlimited claims) tiers.
- Integrated payment service placeholder configured for Razorpay webhooks.

### 3. Client Lead Approval Workflow
- Client-submitted leads land with status `pending`.
- Admins review and approve submissions in the Admin Panel (`/admin/leads`) to prevent spam before going live.
- Admin-created leads are automatically published with status `open`.

### 4. Admin Management & Analytics
- Live metrics: Total leads, Open, Claimed, Pending, Closed, and Active Subscribers.
- Recharts distribution chart showing current marketplace breakdown.
- Full CRUD for leads and categories.
- User management tables showing freelancer subscriber plans and client posting activity.
