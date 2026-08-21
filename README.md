# 📦 Stock Opname Project

> A warehouse stock management module built as part of the **CrewFlow** platform, developed during a software engineering internship.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)

---

## About the Project

**Stock Opname** is a workforce and operations management platform covering attendance, event management, crew scheduling, inventory, and payroll. This repository contains the **Stock Opname (Warehouse Management)** module — one of two parallel workstreams within the broader CrewFlow system.

This project is developed as part of an **internship program**, focusing on real-world application of front-end engineering practices, warehouse operations logic, and collaborative software development within a small product team.

The module manages the end-to-end warehouse flow:

```
Supplier → Warehouse (this module) → Outlet / Branch
```

It supports two categories of managed goods: **packaged consumables** (e.g. chips/snacks requiring repacking) and **physical equipment units** (e.g. photobooth units).

---

## Key Features

- **Dashboard Overview** : Real-time snapshot of inventory summary, incoming goods, active branch orders, and today's shipments
- **Incoming Goods (Barang Masuk)** : Purchase order receiving, quantity verification against PO, batch & expiry tracking, and condition inspection
- **Outgoing Goods (Barang Keluar)** : Branch order allocation, picking, packing, and shipment tracking with status timeline
- **Inventory Management (Persediaan)** : SKU-level stock tracking across multiple storage locations with unit conversion (e.g. box → pieces)
- **Product Master Data** : Centralized product catalog with category, base/wholesale units, and min/max stock thresholds
- **Stock Reconciliation (Selisih)** : System vs. physical count comparison with tolerance-based discrepancy investigation
- **Quarantine Handling** : Isolation workflow for damaged or non-compliant goods pending quality control decisions
- **Waste Tracking** : Damaged/rejected goods logging with loss valuation and disposal status
- **Returns Management (Retur)** : Branch-to-warehouse return requests with approval and inspection workflow
- **Role & Access Administration** : Admin-level user and permission management with full audit logging

---

## System Design

The module's business logic and UI flow were mapped out through structured planning artifacts before implementation, including:

- End-to-end **flowcharts** for administration & access control, goods receiving, outgoing shipment, stock reconciliation, and returns
- **UI mockups** for every core screen (login, dashboard, inbound/outbound goods, inventory, reconciliation, waste, returns, and admin panel)
- A clearly defined **role structure** (Admin, Crew Event, Crew Store) aligned with the broader CrewFlow ecosystem

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios |
| Version Control | Git & GitHub |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/username-kamu/stokopname.git
cd stokopname

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components (Sidebar, Navbar, Cards, Tables)
├── pages/          # Page-level views (Dashboard, Barang Masuk, Persediaan, etc.)
├── layouts/         # Shared layout wrappers
├── routes/          # Route definitions
├── services/        # API service functions
├── types/            # TypeScript interfaces & types
└── utils/            # Helper functions
```

---

## Team

Developed collaboratively as part of the **Stock Opname** internship project, with this module built by the Stock Opname team while a parallel team develops the Attendance (Absensi) module.

**Contributors:**
- M. Fajar Ramadhan
- Salsabila
- Putri

---

## 📌 Project Status

This project is currently **in active development** as part of an ongoing internship. Features and UI are subject to iteration based on stakeholder feedback and evolving business requirements.

---

<p align="center">Built with dedication during an internship journey 🚀</p>
