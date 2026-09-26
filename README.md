# Leads Tracking App
A modern, full-stack Leads Tracking Web App backed by a high-performance Express REST API, SQLite database with Prisma ORM, and React 19 with TypeScript.

---

## Key Features

1. **Full Leads CRUD**:
   - Fields: `id`, `name`, `email`, `phone`, `status` (`new`, `contacted`, `qualified`, `lost`), `createdAt`
   - Immediate search and filter by status
2. **Notes Management**:
   - Unlimited interaction notes per lead (`id`, `leadId`, `content`, `createdAt`)
   - Reverse chronological timeline with keyboard shortcut (`Ctrl + Enter`)
3. **Web Portal UI**:
   - Real-time performance metric badges (Total, New, Qualified, Contacted, Lost)
   - Instant search with debounced typing
   - Interactive slide-over drawer with one-click status transitions and inline editing
   - Toast notification feedback system
4. **Data Validation & Error Handling**:
   - Email format validation, required fields, and enum validation using Zod
   - Standard HTTP response codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error`)
5. **Bonus Capabilities**:
   -  **Pagination**: Supports `page` and `limit` with responsive pagination controls
   -  **Basic Authentication**: Configurable toggle via `BASIC_AUTH_ENABLED`
   -  **Unit Test Suite**: Automated route testing with Vitest & Supertest
   -  **Dockerization**: Ready-to-deploy Dockerfiles and Docker Compose configuration
   -  **Database Seeding**: Realistic seed dataset with diverse leads and notes

---

## Technology Stack

- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM 6, Zod, Vitest, Supertest
- **Database**: SQLite (`dev.db`)
- **Frontend**: React 19, TypeScript, Vite, Lucide Icons, Vanilla CSS Design System

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm 9+

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Push schema to SQLite database and generate Prisma Client
npx prisma db push

# Seed the database with realistic sample leads and notes
npm run seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173 with proxy to backend)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the portal.

---

## Running Automated Tests

Run the automated test suite in the backend:

```bash
cd backend
npm test
```

The test runner will execute tests covering:
- Lead listing with pagination
- Successful lead creation
- Email format validation error (400)
- Single lead fetch with notes (200)
- Adding a note to lead (201)
- Updating lead status (200)
- Handling non-existent leads (404)

---

## Running with Docker

You can launch the entire stack using Docker Compose:

```bash
docker-compose up --build
```

- Web Portal: [http://localhost:3000](http://localhost:3000)
- API Service: [http://localhost:5000](http://localhost:5000)

---

## REST API Reference & `curl` Examples

Base URL: `http://localhost:5000/api`

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Get All Leads (with Search, Status Filter & Pagination)
```bash
# Get all leads (page 1, limit 10)
curl -X GET "http://localhost:5000/api/leads?page=1&limit=10"

# Search by name or email
curl -X GET "http://localhost:5000/api/leads?search=Sarah"

# Filter by status (new, contacted, qualified, lost)
curl -X GET "http://localhost:5000/api/leads?status=qualified"
```

**Example Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne.io",
      "phone": "+1 (555) 234-5678",
      "status": "qualified",
      "createdAt": "2026-09-25T17:15:00.000Z",
      "updatedAt": "2026-09-25T17:15:00.000Z",
      "_count": { "notes": 3 }
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Create a New Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alexander Hayes",
    "email": "ahayes@vanguardtech.com",
    "phone": "+1 (617) 555-0199",
    "status": "new"
  }'
```

**Example Response (201 Created):**
```json
{
  "id": 9,
  "name": "Alexander Hayes",
  "email": "ahayes@vanguardtech.com",
  "phone": "+1 (617) 555-0199",
  "status": "new",
  "createdAt": "2026-09-25T17:20:00.000Z",
  "updatedAt": "2026-09-25T17:20:00.000Z"
}
```

**Validation Error Example (400 Bad Request):**
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Lead",
    "email": "not-valid-email",
    "phone": ""
  }'
```
Response:
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address format" },
    { "field": "phone", "message": "Phone number must be at least 3 characters" }
  ]
}
```

---

### 4. Get a Single Lead (with Notes)
```bash
curl -X GET http://localhost:5000/api/leads/1
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "name": "Sarah Connor",
  "email": "sarah.connor@cyberdyne.io",
  "phone": "+1 (555) 234-5678",
  "status": "qualified",
  "createdAt": "2026-09-25T17:15:00.000Z",
  "updatedAt": "2026-09-25T17:15:00.000Z",
  "notes": [
    {
      "id": 1,
      "leadId": 1,
      "content": "Initial discovery call completed. High intent and budget approved for Q4.",
      "createdAt": "2026-09-25T17:15:00.000Z"
    }
  ]
}
```

---

### 5. Update a Lead (PATCH)
```bash
curl -X PATCH http://localhost:5000/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted"
  }'
```

---

### 6. Delete a Lead
```bash
curl -X DELETE http://localhost:5000/api/leads/9
```

**Example Response (200 OK):**
```json
{
  "message": "Lead deleted successfully",
  "id": 9
}
```

---

### 7. Get Notes for a Lead
```bash
curl -X GET http://localhost:5000/api/leads/1/notes
```

---

### 8. Add a Note to a Lead
```bash
curl -X POST http://localhost:5000/api/leads/1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Follow-up meeting scheduled for Friday at 10 AM PST."
  }'
```

**Example Response (201 Created):**
```json
{
  "id": 15,
  "leadId": 1,
  "content": "Follow-up meeting scheduled for Friday at 10 AM PST.",
  "createdAt": "2026-09-25T17:25:00.000Z"
}
```

---

### 9. Optional Basic Authentication

To enable Basic Auth, set in `backend/.env`:
```env
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=password123
```

Then supply credentials in requests:
```bash
curl -X GET http://localhost:5000/api/leads -u admin:password123
```

---

## Repository Structure

```
LeadsTrackingApp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models for Lead & Note
│   │   └── dev.db              # SQLite database file
│   ├── src/
│   │   ├── __tests__/          # API route automated tests
│   │   │   └── leads.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Optional Basic Auth middleware
│   │   │   └── errorHandler.ts # Centralized error handler
│   │   ├── routes/
│   │   │   └── leads.ts        # Leads and Notes REST API routes
│   │   ├── app.ts              # Express application setup
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── index.ts            # Server entrypoint
│   │   ├── seed.ts             # Sample data seed script
│   │   └── validation.ts       # Zod schemas for input validation
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateLeadModal.tsx
│   │   │   ├── LeadDetailDrawer.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Toast.tsx
│   │   ├── services/
│   │   │   └── api.ts          # Frontend API client
│   │   ├── App.tsx             # Main Leads dashboard
│   │   ├── index.css           # Modern design system stylesheet
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```
