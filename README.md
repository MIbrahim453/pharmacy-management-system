# Pharmacy Management System

A comprehensive, state-of-the-art Pharmacy Management System built to streamline inventory tracking, POS transactions, supplier purchases, and account auditing across multiple pharmacy branches.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Instance (Atlas cluster or local service)
- SMTP Mail Server credentials (e.g., Mailtrap, SendGrid, custom SMTP)

### Installation & Run

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and set the base API URL (e.g. `VITE_BASE_URL='http://localhost:3000/api/v1'`):
   ```bash
   echo "VITE_BASE_URL='http://localhost:3000/api/v1'" > .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## Environment Variables Configuration

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `NODE_ENV` | Mode of execution | `development` / `production` |
| `PORT` | Backend server port | `3000` |
| `FRONTEND_URL` | Frontend client origin URL (CORS verification) | `http://localhost:5173` |
| `DB_NAME` | MongoDB database name | `pharmacy_management` |
| `MONGODB_URI` | Full connection string to MongoDB database | `mongodb+srv://...` |
| `JWT_SECRET` | Primary signing secret for auth access tokens | `long_random_jwt_secret_here` |
| `JWT_REFRESH_SECRET` | Signing secret for session refresh tokens | `long_random_refresh_secret_here` |
| `LOG_LEVEL` | Minimum log logging level output | `info` |
| `EMAIL_HOST` | Host address of target SMTP mail server | `smtp.mailtrap.io` |
| `EMAIL_PORT` | Port of target SMTP mail server | `2525` |
| `EMAIL_USER` | Username authentication for SMTP server | `your_user` |
| `EMAIL_PASS` | Password authentication for SMTP server | `your_pass` |
| `EXPIRY_CHECK_CRON` | Cron schedule string for inventory checking | `0 0 * * *` (Daily at Midnight) |
| `CRON_TIMEZONE` | Timezone context for cron job scheduler | `Asia/Karachi` / `UTC` |

### Frontend Environment Variables (`frontend/.env`)
* `VITE_BASE_URL`: Base API path pointing to backend server endpoints. Example: `http://localhost:3000/api/v1`.

---

## Core System Flows

### 1. Authentication & Active Status Flow
The application implements robust, multi-layered security controls to authenticate users and restrict deactivated or suspended accounts.
- **Authentication Strategies**: Built using `Passport.js` containing two main strategies:
  - **Local Strategy (Login)**: Authenticates credentials (email and password). It populates the user's role and checks the account status.
  - **JWT Strategy (Protected Routes)**: Intercepts requests, decodes the bearer JSON Web Token, and resolves the user's profile and permissions.
- **Status Verification**: Both strategies verify that `status === "active"`. If a user's status is changed to `inactive` or `suspended` by a Super Admin, their login attempts are rejected, and their active JWT sessions are immediately invalidated.
- **Service-Level Enforcement**: As defense in depth, all domain services lookup the requesting user using `{ _id: userId, status: "active" }`. Any database query or transaction aborts immediately with a `BadRequestError` if the user is suspended or inactive.

---

### 2. Medicines, Purchases, & Medicine Batch Lifecycle
Inventory levels are driven by purchases from verified suppliers.
- **Medicine Registration**: Medicines must be registered in the system before they can be purchased. Each medicine is logged with its generic name, manufacturer, packaging, and reorder levels. Newly created medicines have `0` stock and a status of `critical`.
- **Supplier Purchases**:
  - When inventory is received, an Admin logs a **Purchase**. This creates a purchase log containing multiple items, specifying their supplier, cost price, selling price, and target location.
  - An associated **Payable Invoice** and completed outflow **Payment** record are automatically created to audit the expense.
- **MedicineBatch Creation**:
  - For each item in the purchase, the system checks if a batch with the same `batchNumber` and `medicineId` exists for the pharmacy.
  - **Existing Batch**: The system increments the `initialQty`, `currentQty`, and `purchaseQty` of the existing batch.
  - **New Batch**: A new `MedicineBatch` record is created with an `active` status, tracking its unique expiry date, costs, and current stock.
- **Stock Synchronization**: Following the batch updates, the service triggers `syncMedicineStockAndExpiry()`. This calculates the total `currentQty` of all active, unexpired batches for that medicine, updates the medicine's `stockQty`, and adjusts its stock status (`inStock`, `lowStock`, `critical`).

---

### 3. POS Invoice Creation & Inventory Deduction
POS invoices handle sales to customers and automatically deduct stock.
- **POS Checkout Request**: Staff inputs the customer details, payment method, and requested items (medicine and quantity).
- **FIFO & Expiry-Based Allocation**:
  - To prevent medication waste, the system fetches all active `MedicineBatch` records for the requested medicine that are not expired and have `currentQty > 0`.
  - These batches are sorted by `expiryDate` in ascending order (First Expiring, First Out / FIFO).
  - The system loops through these batches, deducting stock from `currentQty` until the requested quantity is completely fulfilled.
  - It creates `InvoiceBatchAllocation` records for each batch to preserve batch-level audit history.
- **Stock & Status Sync**: Recalculates the medicine's remaining total stock and status (`inStock`, `lowStock`, or `critical`) via `syncMedicineStockAndExpiry()`.
- **Invoice & Inflow Payment**: Generates a **Receivable Invoice** and writes an inflow **Payment** record representing the successful transaction.

---

### 4. Cron Expiry Checks & Scheduler
The system schedules automated checks to transition near-expiry and expired batches.
- **Execution Schedule**: Governed by the `EXPIRY_CHECK_CRON` environment variable (defaults to daily at midnight `0 0 * * *`).
- **Timezone Support**: Built-in support for timezones configured via `CRON_TIMEZONE` (e.g., `Asia/Karachi`), ensuring the task executes exactly when the day changes locally.
- **Task Behavior**:
  - Evaluates all active `MedicineBatch` records.
  - If a batch has passed its `expiryDate`, its status is updated to `expired`.
  - Triggers `syncMedicineStockAndExpiry()` on updated medicines to ensure low-stock and out-of-stock indicators match current batch statuses.
