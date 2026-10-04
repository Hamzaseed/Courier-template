# 🚀 CourierFlow - Courier & Logistics Management Portal

**CourierFlow** is a modern, responsive, full-featured Courier & Logistics Management Portal built with **Next.js 16 (App Router)**, **TypeScript**, **React 19**, and **Redux Toolkit**. It includes role-based dashboards (Admin, Merchant, Rider), public package tracking, and local state persistence.

This project is ready to clone, run locally, customize, and extend for your own personal or business logistics applications!

---

## 📋 Table of Contents

- [Features & Workflows](#-features--workflows)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Customization Guide](#-customization-guide)
- [Scripts & Commands](#-scripts--commands)
- [License](#-license)

---

## ✨ Features & Workflows

### 🛡️ Admin Portal (`/admin`)
- **Operations Dashboard**: Real-time metrics for shipments, revenue, and active deliveries.
- **Shipment Management**: Complete control over creation, status updates, timelines, and tracking details.
- **Hub & Rider Management**: Assign shipments to hubs, dispatch riders, and track rider workloads.
- **Manifests & Pickups**: Generate dispatch manifests and schedule bulk merchant pickups.
- **COD & Financials**: Monitor Cash-on-Delivery collections, settlements, and merchant payouts.
- **Complaints & Returns**: Manage return-to-origin (RTO) flows and customer support tickets.

### 🏪 Merchant Portal (`/merchant`)
- **Shipment Creation**: Single or bulk shipment creation with automatic tracking number generation.
- **Pickup Requests**: Schedule pickup dates/times for courier riders.
- **Invoices & COD**: View ledger balances, payout statements, and transaction histories.
- **Integration & Settings**: Custom merchant settings, store integration hooks, and business profiles.

### 🛵 Rider Portal (`/rider`)
- **Delivery Workflow**: View assigned daily deliveries, update order statuses (Delivered / Failed / In Transit).
- **COD Collection**: Record collected cash amounts directly upon delivery.
- **Delivery History**: Review completed orders and daily task logs.

### 🔍 Public Tracking (`/tracking`)
- Real-time order tracking interface accessible to customers without logging in.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI & Styling**: React 19, Vanilla CSS (CSS Modules / Global utility styles)
- **Icons**: `react-icons` (Lucide / Feather / FontAwesome icons)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`), `react-redux`
- **Data Persistence**: `localStorage` (Redux state synced per module)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher (v20+ recommended)
- **npm** (v9+) or **yarn** / **pnpm** / **bun**
- **Git**

---

## 🚀 Getting Started (Local Setup)

Follow these steps to get a local copy up and running:

### 1. Clone the Repository
```bash
git clone https://github.com/Hamzaseed/Courier-template.git
cd Courier-template
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🔑 Demo Credentials

The app comes pre-seeded with demo data. All demo accounts use the same default password:

| Role | Email | Default Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `demo123` | `/admin` |
| **Merchant** | `merchant@demo.com` | `demo123` | `/merchant` |
| **Rider** | `rider@demo.com` | `demo123` | `/rider` |

---

## 📁 Project Structure

```text
Courier-template/
├── src/
│   ├── app/                    # Next.js 16 App Router pages & layouts
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── merchant/           # Merchant dashboard pages
│   │   ├── rider/              # Rider portal pages
│   │   ├── tracking/           # Public tracking page
│   │   ├── login/              # Login authentication page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Shell, Header, Sidebar, Navigation
│   │   ├── shared/             # Consoles & layout components
│   │   └── ui/                 # Metric cards, status badges, empty states
│   ├── redux/                  # State management
│   │   ├── slices/             # Feature slices (shipments, auth, riders, etc.)
│   │   └── store.ts            # Redux store & localStorage middleware
│   ├── styles/                 # Global CSS stylesheet (`globals.css`)
│   ├── lib/
│   │   ├── seed.ts             # Default mock data for initial state
│   │   └── types.ts            # TypeScript interfaces & type definitions
│   └── hooks/                  # Custom Typed React/Redux hooks
├── public/                     # Static assets & public images
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## 🎨 Customization Guide (For Personal Use)

If you want to modify or adapt this template for your own business or project:

### 1. Changing Brand Name & Styling
- **Colors & Themes**: Open `src/styles/globals.css` to update CSS color variables, font families, and background gradients.
- **Logo & Branding**: Modify `src/components/common/SwiftLineLogo.tsx` to update the application logo and title.

### 2. Modifying Default Seed Data
- Edit `src/lib/seed.ts` to customize default merchants, riders, hubs, pricing rules, or mock shipments.
- To clear your local stored data and reload fresh seed data, open your browser's Developer Tools (F12) -> Application -> Local Storage -> Clear All, then refresh the page.

### 3. Adding New Features or Redux State
- Create a new Redux slice under `src/redux/slices/<feature>/`.
- Export your reducers and register them in `src/redux/store.ts`.

### 4. Connecting a Real Backend / Database
- Replace the Redux `localStorage` sync in `src/utils/api.ts` or Redux slices with actual API calls (`fetch` / `axios` / `RTK Query`) to your backend server (e.g. Node.js, Python, Firebase, PostgreSQL, MongoDB).

---

## 📜 Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | Builds the optimized production application |
| `npm start` | Starts the production server (after running `npm run build`) |
| `npm run lint` | Runs ESLint to check for code formatting and quality issues |

---

## 📄 License

Distributed under the MIT License. Feel free to use, modify, and distribute this template for personal or commercial projects.
