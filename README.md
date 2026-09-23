# 📊 Performance Evaluation System

<div align="center">

*A role-based, criteria-driven performance evaluation platform for organizations with multiple departments, built with .NET 8, React, TypeScript and SQL Server, following Onion Architecture. Admins define weighted evaluation criteria per job position, Evaluators (team leads / managers) score the employees assigned to them across any department, and Employees track their own performance history — producing a transparent, weighted final score and ranking, department by department.*

![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver)
![Entity Framework Core](https://img.shields.io/badge/EF_Core-512BD4?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger)
![xUnit](https://img.shields.io/badge/xUnit-512BD4?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx)

</div>

---

## 📌 Project Overview

The **Performance Evaluation System** is a full-stack web application built to measure employee performance across an entire organization — not limited to a single department — in an objective, transparent, and score-based way.

Traditional performance reviews are often subjective and inconsistent across teams and departments. This project solves that by introducing **job-position-specific, weighted evaluation criteria**: every job position is measured against the same top-level categories, but each category can carry job-position-specific sub-criteria and descriptions. Scores are combined using a weighted formula to produce one comparable, auditable number per employee, per evaluation period — regardless of which department that employee belongs to.

The system supports three roles — **Admin**, **Evaluator**, and **Employee** — each with a distinct view and permission set, and produces per-department dashboards, rankings, and exportable reports.

### Problem it solves
- Inconsistent, undocumented performance reviews across different departments and job positions
- No standardized, weighted way to compare employees who hold different job positions
- No historical record employees can review their own feedback and score trend against
- No centralized reporting/ranking view for managers across departments, periods, and teams

### User Roles
| Role | Summary |
|------|---------|
| 🛠️ **Admin** | Manages users, departments, job positions, roles, criteria and weights; views all departments' scores and reports |
| 👨‍💼 **Evaluator** (Team Lead / Manager) | Evaluates only the employees assigned to them, regardless of department; adds comments; views their team's history and ranking |
| 👩‍💻 **Employee** (any job position, any department) | Views their own score history, feedback, and progress over time |

---

# 🚀 Features

## 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Passwords hashed with BCrypt
- Role-Based Access Control (RBAC): Admin / Evaluator / Employee
- Resource-level authorization — an Evaluator can only access data for employees explicitly assigned to them
- Protected REST endpoints with role- and ownership-based middleware

> 🖼️ *Add a screenshot of the login page here:*
> ```markdown
> <img src="images/login.png" width="60%" alt="Login Page"/>
> ```

## 🏢 Department, Job Position & User Management
- Manage multiple departments across the organization
- Manage job positions independently of department (criteria descriptions are tailored per job position)
- Create, list, and manage users (name, email, role, department, job position)
- Activate / deactivate user accounts

> 🖼️ *Add a screenshot of the Admin dashboard here:*
> ```markdown
> <img src="images/dashboard-admin.png" width="70%" alt="Admin Dashboard"/>
> ```

## 🧩 Job-Position-Based Criteria Management
- Admin defines top-level performance **categories** (e.g. Quality of Work, Communication, Delivery/Timeliness) that apply organization-wide
- Each category contains **sub-criteria**, with descriptions that can differ per job position while sharing the same category — so a Developer and a QA Engineer (or an HR specialist and a Sales rep) are scored on comparable categories, worded appropriately for their role
- Category weights (percentages) are fully configurable
- Criteria and categories can be activated/deactivated without deleting historical data

> 🖼️ *Add a screenshot of the criteria management page here:*
> ```markdown
> <img src="images/criteria-management.png" width="70%" alt="Criteria Management"/>
> ```

## ⚖️ Weighted Scoring Engine
- Evaluators score each sub-criterion on a 1–5 scale
- Category score is calculated as the average of its sub-criterion scores, multiplied by the category weight
- Total score is the sum of all weighted category scores

```
Category Score = Average(Criterion Scores) × Category Weight
Total Score     = Σ (Category Score)
```

> 🖼️ *Add a screenshot of the evaluation form (1–5 scoring) here:*
> ```markdown
> <img src="images/evaluation-form.png" width="70%" alt="Evaluation Form"/>
> ```

## 🗓️ Evaluation Periods & Evaluator Assignment
- Admin defines evaluation periods (e.g. quarterly, semi-annual)
- Evaluator–Employee assignments determine who can evaluate whom, across any department
- Repeat evaluations of the same employee are supported across different periods

## 🏆 Ranking & Reporting
- Organization-wide and per-department ranking (Admin view)
- Team-level ranking (Evaluator view)
- Personal score history and trend (Employee view), presented as charts and tables
- Reports exportable to **Excel**

> 🖼️ *Add screenshots of the reports/ranking page and an exported Excel file here:*
> ```markdown
> <img src="images/reports-ranking.png" width="70%" alt="Reports & Ranking"/>
> <img src="images/excel-export.png" width="70%" alt="Excel Export"/>
> ```

## 🌍 Internationalization (i18n)
- Multi-language UI support

## 🛡 Rate Limiting
- Login endpoint protected against brute-force attacks using ASP.NET Core's built-in Rate Limiting middleware (.NET 8)
- Fixed Window limiter: max **5 login attempts per IP per minute**
- No external dependency (e.g. Redis) required — sufficient for a single-instance deployment

## 🧪 Testing & Coverage
- Backend unit and integration tests (xUnit)
- Frontend component/page tests (Vitest + React Testing Library)
- Role-based authorization tests (Admin / Evaluator / Employee access rules)
- Score-calculation accuracy tests
- A dedicated coverage pipeline collects and reports coverage for both suites (see [Testing & Coverage](#-testing--coverage-1) below)

## 🐳 Containerization
- Fully Dockerized: SQL Server, backend API, and frontend (served via Nginx)
- Separate `Dockerfile.backend` and `Dockerfile.frontend`, orchestrated with a single `docker-compose.yml`
- One-command startup with Docker Compose

> 🖼️ *Add a screenshot of the running containers (Docker Desktop) here:*
> ```markdown
> <img src="images/docker-containers.png" width="70%" alt="Docker Containers"/>
> ```

---

# 🛠 Technology Stack

## Backend
```text
C#
.NET 8
ASP.NET Core Web API
Entity Framework Core
FluentValidation
AutoMapper
JWT Authentication
BCrypt.Net (password hashing)
ASP.NET Core Rate Limiting Middleware
Swagger / OpenAPI
```

## Frontend
```text
React
TypeScript
Vite
MUI (Material UI)
Zustand (state management)
Axios (with interceptors)
React Router (ProtectedRoute)
i18next (internationalization)
```

## Database
```text
Microsoft SQL Server
EF Core Migrations
```

## Testing & Coverage Tooling
```text
xUnit
Integration Tests (WebApplicationFactory)
Vitest
React Testing Library (RTL)
coverlet / coverage.runsettings (backend coverage collection)
PowerShell coverage script (scripts/coverage.ps1)
```

## Infrastructure & Deployment
```text
Docker
Docker Compose
Dockerfile.backend / Dockerfile.frontend
Nginx (frontend static hosting / reverse proxy)
```

---

# 🏗 Architecture — Onion Architecture

The backend follows **Onion Architecture**, keeping the domain model at the center and isolating it from infrastructure and delivery concerns. Dependencies always point **inward**, toward the Domain.

```text
                ┌─────────────────────────────────────────┐
                │                   API                    │
                │   Controllers · Middleware · Program.cs  │
                │        (JWT Auth, Rate Limiting)         │
                └───────────────────┬───────────────────────┘
                                    ▼
                ┌─────────────────────────────────────────┐
                │               Application                │
                │  Services · DTOs · Interfaces · Mappings │
                │      Validators (FluentValidation)       │
                └───────────────────┬───────────────────────┘
                                    ▼
                ┌─────────────────────────────────────────┐
                │             Infrastructure                │
                │  EF Core DbContext · Repositories        │
                │        Migrations · External Services    │
                └───────────────────┬───────────────────────┘
                                    ▼
                ┌─────────────────────────────────────────┐
                │                 Domain                    │
                │      Entities · Enums · Core Interfaces   │
                │         (no external dependencies)       │
                └─────────────────────────────────────────┘
```

- **Domain** — Pure entities and enums (`User`, `Evaluation`, `PerformanceCriterion`, etc.) with zero dependency on any other layer.
- **Application** — Business logic, use cases, DTOs, interfaces implemented by Infrastructure, and validation rules.
- **Infrastructure** — EF Core implementation, repositories, database migrations, and any external integrations.
- **API** — Controllers, JWT authentication, rate-limiting middleware, and request/response handling; depends on Application only through interfaces.

The frontend follows a **feature-based architecture**, grouping components, hooks, services and state by business feature (e.g. `criteria`, `evaluations`, `reports`) rather than by technical type.

> 🖼️ *Optional: add an architecture diagram (e.g. drawn in draw.io/Excalidraw) here:*
> ```markdown
> <img src="images/architecture-diagram.png" width="70%" alt="Onion Architecture Diagram"/>
> ```

---

# 📂 Project Structure

```text
performance-evaluation-system
├── .github                     # CI/CD workflows
├── coverage-config
│   └── coverage.runsettings    # Backend coverage collection settings
├── coverage-report
│   └── backend                 # Generated HTML/summary coverage report
├── coverage-temp                # Raw coverage output (git-ignored)
│   ├── integration
│   └── unit
├── scripts
│   └── coverage.ps1            # Runs tests + generates the coverage report
├── src                          # Backend source (Onion layers)
│   ├── PerformanceEvaluationSystem.API
│   │     ├── Controllers
│   │     │     ├── AuthController.cs
│   │     │     ├── UserController.cs
│   │     │     ├── CriteriaController.cs
│   │     │     ├── EvaluationPeriodController.cs
│   │     │     ├── EvaluatorEmployeesController.cs
│   │     │     ├── EvaluationsController.cs
│   │     │     └── ReportsController.cs
│   │     ├── Middleware
│   │     └── Program.cs
│   ├── PerformanceEvaluationSystem.Application
│   │     ├── DTOs
│   │     ├── Interfaces
│   │     ├── Services
│   │     ├── Mappings          # AutoMapper profiles
│   │     └── Validators         # FluentValidation
│   ├── PerformanceEvaluationSystem.Domain
│   │     ├── Entities
│   │     │     ├── User.cs
│   │     │     ├── Department.cs
│   │     │     ├── JobPosition.cs
│   │     │     ├── PerformanceCategory.cs
│   │     │     ├── PerformanceCriterion.cs
│   │     │     ├── CriterionJobPosition.cs
│   │     │     ├── EvaluationPeriod.cs
│   │     │     ├── EvaluatorEmployee.cs
│   │     │     ├── Evaluation.cs
│   │     │     └── EvaluationDetail.cs
│   │     ├── Enums
│   │     │     └── EvaluationStatus.cs
│   │     └── Interfaces
│   └── PerformanceEvaluationSystem.Infrastructure
│         ├── Data               # DbContext
│         ├── Repositories
│         └── Migrations
├── tests
│   ├── UnitTests
│   └── IntegrationTests
├── frontend
│   ├── src
│   │   ├── features
│   │   │     ├── auth
│   │   │     ├── users
│   │   │     ├── criteria
│   │   │     ├── evaluations
│   │   │     └── reports
│   │   ├── components            # Shared/reusable UI components
│   │   ├── store                 # Zustand stores
│   │   ├── services               # Axios instance + interceptors
│   │   ├── routes                 # ProtectedRoute, role guards
│   │   ├── i18n                   # Language files
│   │   └── theme                  # MUI theme (brand colors)
│   └── coverage                  # Frontend coverage output (git-ignored)
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── PerformanceEvaluationSystem.sln
└── README.md
```

---

# 🧬 Domain Model

| Entity | Description |
|--------|-------------|
| `User` | Application user — name, email, hashed password, role, department, job position, active/inactive status |
| `Department` | Any organizational department (not limited to a single one) that a user belongs to |
| `JobPosition` | A job position independent of department — determines which criterion descriptions apply |
| `PerformanceCategory` | Top-level, organization-wide scoring category with a configurable weight (%) |
| `PerformanceCriterion` | Sub-criterion belonging to a category, scored 1–5 |
| `CriterionJobPosition` | Maps a criterion to a job-position-specific description |
| `EvaluationPeriod` | A defined time window in which evaluations take place |
| `EvaluatorEmployee` | Assignment linking an Evaluator to the Employees they may score, independent of department |
| `Evaluation` | A single evaluation record — evaluator, employee, period, date, comment, total score |
| `EvaluationDetail` | Individual criterion score within an `Evaluation` |

### Scoring Logic

```
Category Score = Average(Criterion Scores) × Category Weight
Total Score     = Σ (Category Score)
```

Example: if "Quality of Work" (weight 30%) has criterion scores of 4 and 5 → average 4.5 → category score = 4.5 × 0.30 = 1.35. This is repeated for every category and summed into the employee's final score for that period.

---

# 🔒 Security

| Concern | Implementation |
|---------|----------------|
| Authentication | JWT (stateless) |
| Password storage | BCrypt hashing |
| Authorization | Role-Based Access Control (Admin / Evaluator / Employee) |
| Data scoping | Resource-level authorization — Evaluators only see assigned Employees |
| Brute-force protection | ASP.NET Core Rate Limiting middleware — Fixed Window, 5 requests/IP/minute on `/api/auth/login` |
| Input validation | FluentValidation on all write endpoints |
| Data integrity | Unique constraints (e.g. one active user per email) |
| Data retention | Soft delete on key entities instead of hard deletion |
| Standards | Designed with OWASP guidelines in mind |

All protected endpoints require a valid JWT:

```http
Authorization: Bearer <jwt-token>
```

---

# 📦 API Overview

Swagger UI is available after running the backend:

```
https://localhost:7170/swagger/index.html
```

> 🖼️ *Add a screenshot of the Swagger endpoint list here:*
> ```markdown
> <img src="images/swagger-ui.png" width="70%" alt="Swagger UI"/>
> ```

## 🔐 Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Admin |
| POST | `/api/auth/login` | Authenticate and receive a JWT | Public |

## 👤 Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List users | Admin |
| PUT | `/api/users/{id}` | Update role/department/status | Admin |

## 🧩 Criteria
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/criteria` | List categories & criteria | Admin / Evaluator |
| POST | `/api/criteria` | Create category or criterion | Admin |
| PUT | `/api/criteria/{id}` | Update criterion / weight | Admin |
| PATCH | `/api/criteria/{id}/status` | Activate / deactivate | Admin |

## 🗓️ Evaluation Periods
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/evaluation-periods` | List periods | Admin / Evaluator |
| POST | `/api/evaluation-periods` | Create a period | Admin |

## 🔗 Evaluator–Employee Assignments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/evaluator-employees` | List assignments | Admin |
| POST | `/api/evaluator-employees` | Assign an employee to an evaluator | Admin |

## 📝 Evaluations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/evaluations` | Submit an evaluation | Evaluator |
| GET | `/api/evaluations/{id}` | Get evaluation details | Admin / Evaluator / Employee (own) |
| GET | `/api/evaluations/my` | Get the authenticated employee's evaluations | Employee |

## 📊 Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/department-ranking` | Ranking within a chosen department | Admin |
| GET | `/api/reports/team-ranking` | Team ranking | Evaluator |
| GET | `/api/reports/my-history` | Personal score history | Employee |
| GET | `/api/reports/export` | Export report to Excel | Admin / Evaluator |

---

# ⚙️ Installation

## Prerequisites
- .NET 8 SDK
- Node.js & npm
- Docker Desktop & Docker Compose
- SQL Server (or use the Dockerized instance)
- Visual Studio / VS Code
- PowerShell (for the coverage script)

## Clone Repository
```bash
git clone https://github.com/<your-username>/performance-evaluation-system.git
cd performance-evaluation-system
```

---

# 🐳 Run with Docker (recommended)

The full stack — SQL Server, backend API, and frontend (Nginx) — is defined in `docker-compose.yml`, building the backend and frontend from their own `Dockerfile.backend` and `Dockerfile.frontend`.

```bash
docker compose up -d
```

Check running containers:
```bash
docker ps
```

View logs:
```bash
docker compose logs -f
```

Stop services:
```bash
docker compose down
```

Stop and remove volumes (resets the database):
```bash
docker compose down -v
```

> 🖼️ *Add the running-containers screenshot from Docker Desktop here (see the Containerization section above for the same placeholder).*

---

# ▶️ Run Locally (without Docker)

## Backend
```bash
cd src/PerformanceEvaluationSystem.API
dotnet restore
dotnet ef database update
dotnet run
```
API available at: `https://localhost:7170`
Swagger UI: `https://localhost:7170/swagger/index.html`

## Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend available at: `http://localhost:5173`

---

# 🗄 Database & EF Core Migrations

Connection string and other settings are configured in `appsettings.json` / `appsettings.Development.json` (and `.env` for containerized runs):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=PerformanceEvaluationSystem;User Id=...;Password=...;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "...",
    "Issuer": "...",
    "Audience": "...",
    "ExpiresInMinutes": 60
  }
}
```

Apply migrations:
```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---

# 🌱 Environment Variables

| Variable | Description |
|----------|--------------|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__Key` | Secret key used to sign JWTs |
| `Jwt__Issuer` / `Jwt__Audience` | JWT issuer/audience validation values |
| `VITE_API_BASE_URL` | Backend API base URL used by the frontend |

A local `.env` file holds these values for Docker Compose. **Make sure `.env` is listed in `.gitignore` before pushing** — it currently is not, and real secrets should never be committed.

---

# 🧪 Testing & Coverage

## Running the tests

**Backend:**
```bash
dotnet test
```

**Frontend:**
```bash
cd frontend
npm run test
```

## Coverage pipeline

Coverage collection is driven by `scripts/coverage.ps1`, using the settings in `coverage-config/coverage.runsettings`:

```powershell
./scripts/coverage.ps1
```

This script:
- Runs backend **unit** and **integration** test suites separately, writing raw results to `coverage-temp/unit` and `coverage-temp/integration`
- Merges the results and generates a human-readable report under `coverage-report/backend`
- (Frontend coverage is generated separately via `npm run test -- --coverage`, output to `frontend/coverage`)

All raw/generated coverage folders (`coverage-temp/`, `coverage-report/`, `frontend/coverage/`, `.coverage/`) are git-ignored — only the `coverage-config/coverage.runsettings` and `scripts/coverage.ps1` that produce them are committed.

Tests cover:
- User authentication & registration
- Role-based authorization rules (Admin / Evaluator / Employee)
- Criteria and weight management
- Evaluation submission and score calculation accuracy
- Report/ranking generation
- Component/page rendering and protected-route/role-guard behavior (frontend)

> 🖼️ *Add backend and frontend coverage report screenshots here:*
> ```markdown
> <img src="images/backend-coverage.png" width="70%" alt="Backend Coverage Report"/>
> <img src="images/frontend-coverage.png" width="70%" alt="Frontend Coverage Report"/>
> ```

---

# 🎬 Demo Video

> 📌 *Record a 1–2 minute walkthrough: login as Admin → define a criterion/weight → login as Evaluator → score an employee → login as Employee → view score history → export a report to Excel. Upload it directly to GitHub (drag it into a PR/README edit box) or link a YouTube/Loom recording, then embed it here:*

```markdown
[![Watch the demo](images/video-thumbnail.png)](https://your-video-link)
```

---

# 🗺 Roadmap / Future Improvements
- Push/email notifications when a new evaluation is submitted
- Configurable evaluation templates per department (in addition to per job position)
- PDF export in addition to Excel
- Audit log for criteria/weight changes
- Multi-instance deployment with distributed rate limiting (Redis-backed) if scaled horizontally

---

# 📚 Key Concepts Covered
```text
Onion Architecture
ASP.NET Core Web API (.NET 8)
Entity Framework Core & Migrations
JWT Authentication
Role-Based Access Control (RBAC)
Resource-Level Authorization
FluentValidation
AutoMapper
ASP.NET Core Rate Limiting Middleware
React + TypeScript + Vite
MUI (Material UI)
Zustand State Management
Axios Interceptors
Protected Routes / Role Guards
Internationalization (i18n)
Weighted Scoring Algorithms
Excel Reporting/Export
xUnit & Integration Testing
Vitest & React Testing Library
Automated Code Coverage Pipeline (PowerShell + coverage.runsettings)
Docker & Docker Compose (separate backend/frontend Dockerfiles)
Nginx
Swagger / OpenAPI
Clean Code Principles
```

---

# 👩‍💻 Author

**Öykü Eyüboğlu**
