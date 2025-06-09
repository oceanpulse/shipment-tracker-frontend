# Real-Time Shipment Tracker & Alert System (Logistics Demo)

This project is a demonstration application built by Clint Edward Cloete to showcase skills in Node.js, Vue.js, WebSockets, and AWS for a potential role at a logistics company. It simulates a real-time shipment tracking system with alerts, using South African geographical context for mock data.

**Current Status: Phase 1 Complete (Core Functionality Implemented)**. Phase 2 (Advanced Features) is planned.

**Detailed Project Documentation & Video Walkthrough:**
*   (https://drive.google.com/file/d/1SgNpC_LpZGc9HRJqguM3IP3SPCUvBQQN/view?usp=drive_link)

---

## Overview

This system comprises two main components:

1.  **Backend (`shipment-tracker-backend/`):** A Node.js/Express.js server providing a REST API, WebSocket communication (Socket.IO) for real-time updates, and a shipment activity simulator. It connects to an AWS RDS (MariaDB) database.
2.  **Frontend (`shipment-tracker-frontend/`):** A Vue.js 3 SPA (Vuetify 3, Tailwind CSS) that displays shipment information, a real-time map (Leaflet), and UI alerts.

---

## Tech Stack Highlights

*   **Backend:** Node.js, Express.js, Socket.IO, AWS RDS (MariaDB)
*   **Frontend:** Vue.js 3, Vite, Vuetify 3, Tailwind CSS, Pinia, Leaflet
*   **Real-Time Communication:** WebSockets (Socket.IO)

---

## Getting Started

This project is divided into a backend and a frontend, each with its own setup instructions.

1.  **Set up the Backend:**
    *   Navigate to the `shipment-tracker-backend/` directory.
    *   Follow the instructions in `shipment-tracker-backend/README.md`.
2.  **Set up the Frontend:**
    *   Navigate to the `shipment-tracker-frontend/` directory.
    *   Follow the instructions in `shipment-tracker-frontend/README.md`.

Once both are running, you can access the application via the frontend URL (typically `http://localhost:5173`).

---

## Phase 1 Features (Implemented)

*   Real-time shipment tracking on a map (South Africa focus).
*   Dynamic list of shipments.
*   UI alerts for significant shipment events.
*   Backend simulator for generating live data.
*   AWS RDS (MariaDB) for data persistence.

## Phase 2 Enhancements (Planned)

*   Authentication & Authorization (JWTs)
*   Robust Error Handling
*   Scalability improvements (Socket.IO adapter)
*   Enhanced Security (HTTPS, Input Validation, IAM Roles)
*   Advanced Alerting (Email/SMS)
*   Geofencing
*   Shipment History/Event Log
*   Automated Testing (Unit & E2E)
*   CI/CD Pipeline

See the full [Project Documentation](https://drive.google.com/file/d/1SgNpC_LpZGc9HRJqguM3IP3SPCUvBQQN/view?usp=drive_link) for more details on Phase 2.

---
Clint Edward Cloete
[oceanicpulse24@gmail.com]
[https://github.com/oceanpulse]
[https://clintedward.tech]
