# VakıfBank 360 — Performance Evaluation System

A role-based, criteria-driven performance evaluation platform for organizations with multiple departments.

The system is built with **.NET 8, React, TypeScript, SQL Server and Docker**. It follows an **Onion Architecture** on the backend and a feature-based structure on the frontend.

Administrators manage users, departments, job positions, evaluation periods and weighted performance criteria. Evaluators assess employees assigned to them, while employees can view their own performance history and score trends.

---

## 1. Project Overview

### Problem Solved

The system provides a centralized and standardized performance evaluation process by:

- Defining performance criteria according to job positions
- Assigning configurable weights to performance categories
- Restricting Evaluators to the employees assigned to them
- Calculating weighted performance scores
- Maintaining evaluation history by period
- Providing department and team rankings
- Providing employees with access to their own performance history
- Supporting Excel report export
- Supporting Turkish and English user interfaces
- Providing role-based access control and protected API endpoints

### User Roles

| Role | Main Responsibilities |
|---|---|
| **Admin** | Manages users, departments, job positions, criteria, weights, evaluation periods and evaluator assignments; monitors evaluation results and reports |
| **Evaluator** | Evaluates assigned employees, enters criterion scores and comments, and views team results and rankings |
| **Employee** | Views personal performance scores, evaluation history and score trends |

---

# 2. Main Features

## Authentication & Authorization

- JWT-based authentication
- BCrypt password hashing
- Role-Based Access Control (RBAC)
- Admin / Evaluator / Employee authorization
- Resource-level authorization for Evaluator access
- Protected API endpoints
- Login rate limiting
- Password change functionality for administrators

## User & Organization Management

- Department management
- Job position management
- User creation and management
- Role assignment
- Department and job-position assignment
- User activation/deactivation

## Criteria & Category Management

- Performance category management
- Performance criterion management
- Job-position-specific criterion descriptions
- Configurable category weights
- Activation/deactivation of criteria and categories
- Preservation of historical evaluation data

## Evaluation Management

- Evaluation period management
- Evaluator–Employee assignments
- Criterion-based scoring from 1 to 5
- Comments on evaluations
- Evaluation status management
- Historical evaluations by period

## Weighted Scoring

The system calculates performance using weighted category scores.

```text
Category Score = Average(Criterion Scores) × Category Weight

Total Score = Σ(Category Score)
```

Example:

```text
Quality of Work
Weight: 30%
Criterion scores: 4, 5

Average = 4.5
Category contribution = 4.5 × 0.30 = 1.35
```

The same calculation is applied to all categories and summed to obtain the employee's total score.

## Dashboards & Reporting

- Admin dashboard
- Evaluator dashboard
- Employee dashboard
- Department rankings
- Team rankings
- Personal score history
- Score trend visualization
- Excel export

## Internationalization

- Turkish / English interface
- Centralized translation structure
- Language selection persisted on the client

## Security

- JWT authentication
- BCrypt password hashing
- Role-based authorization
- Resource-level access control
- FluentValidation for input validation
- Login rate limiting
- Unique email constraint
- Soft-delete / active-state handling where applicable

## Containerization

The application is containerized with Docker:

```text
SQL Server
    │
    ▼
.NET 8 Web API
    │
    ▼
React + Vite + Nginx
```

The complete stack can be started with Docker Compose.

---

# 3. Technology Stack

## Backend

- C#
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- FluentValidation
- AutoMapper
- JWT Authentication
- BCrypt.Net
- ASP.NET Core Rate Limiting
- Swagger / OpenAPI

## Frontend

- React
- TypeScript
- Vite
- Material UI (MUI)
- Zustand
- Axios
- React Router

## Database

- Microsoft SQL Server
- Entity Framework Core Migrations

## Testing

- xUnit
- ASP.NET Core integration tests / WebApplicationFactory
- Vitest
- React Testing Library
- Coverlet
- PowerShell coverage scripts

## Infrastructure

- Docker
- Docker Compose
- Nginx

---

# 4. Architecture

## Backend — Onion Architecture

The backend is organized into four main layers:

```text
┌──────────────────────────────────────────┐
│                    API                   │
│ Controllers · Middleware · Program.cs    │
│ JWT Authentication · Rate Limiting       │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│               Application                │
│ Services · DTOs · Interfaces             │
│ Validators · Mappings                    │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│             Infrastructure               │
│ EF Core · DbContext · Repositories        │
│ Migrations · Data Access                 │
└────────────────────┬─────────────────────┘
                     ▼
┌──────────────────────────────────────────┐
│                 Domain                   │
│ Entities · Enums · Core Interfaces       │
└──────────────────────────────────────────┘
```

Dependencies are directed inward toward the Domain layer.

### Domain

Contains the core business entities and enums.

### Application

Contains business logic, DTOs, service interfaces, validators and mappings.

### Infrastructure

Contains Entity Framework Core, repositories, database configuration and migrations.

### API

Contains controllers, authentication, middleware and HTTP request/response handling.

## Frontend

The React application uses a feature-oriented structure with reusable components, services, state management, protected routes and centralized language/theme handling.

---

# 5. Project Structure

```text
performance-evaluation-system/
│
├── .github/                    # CI/CD workflows
├── coverage-config/            # Coverage configuration
├── db-transfer/                # Database-related transfer/scripts
├── scripts/                    # Utility scripts
│
├── src/                        # .NET backend
│   ├── PerformanceEvaluationSystem.API/
│   ├── PerformanceEvaluationSystem.Application/
│   ├── PerformanceEvaluationSystem.Domain/
│   └── PerformanceEvaluationSystem.Infrastructure/
│
├── tests/
│   ├── UnitTests/
│   └── IntegrationTests/
│
├── frontend/                   # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .dockerignore
├── .env                        # Local/Docker environment configuration
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── PerformanceEvaluationSystem.sln
└── README.md
```

Generated folders such as `node_modules`, `bin`, `obj`, `coverage-temp`, `coverage-report` and frontend build/coverage output are not required to run the application and should not be included in the source-code delivery package.

---

# 6. Requirements

## Recommended: Docker Desktop

For the easiest setup, install:

- Docker Desktop
- Git (if cloning from a repository)

With Docker, you do **not** need to install SQL Server, .NET 8 SDK or Node.js separately just to run the complete application.

## Optional: Local Development

For running the services outside Docker:

- .NET 8 SDK
- Node.js and npm
- SQL Server
- Visual Studio or VS Code

---

# 7. Configuration

The project uses environment variables for Docker-based configuration.

Before starting the application, make sure the required environment variables are configured in the project's `.env` file.

Example structure:

```env
SA_PASSWORD=your_sql_server_password
JWT_SECRET=your_jwt_secret
```

> **Security:** Never commit real production passwords, JWT secrets or other sensitive credentials to a public repository. For source-code distribution, use an `.env.example` file with placeholder values. If a demo `.env` is distributed with the project, its credentials must be dedicated to the demo environment and must not be reused elsewhere.

---

# 8. Run the Application with Docker

Docker Compose is the recommended way to run the complete system.

## Step 1 — Open the project directory

Open PowerShell or a terminal in:

```text
performance-evaluation-system
```

## Step 2 — Check Docker

Run:

```powershell
docker --version
docker compose version
```

Make sure Docker Desktop is running.

## Step 3 — Start the application

Run:

```powershell
docker compose up -d --build
```

The `--build` option ensures that the backend and frontend images are rebuilt from the current source code.

## Step 4 — Check the containers

Run:

```powershell
docker ps
```

The application should have containers for:

- SQL Server
- Backend API
- Frontend

## Step 5 — Open the application

### Frontend

```text
http://localhost
```

### Backend API

```text
http://localhost:8080
```

### Swagger

```text
http://localhost:8080/swagger
```

Swagger provides interactive documentation for the REST API.

## Step 6 — Check application logs

If there is a problem during startup:

```powershell
docker compose logs -f
```

For a specific service:

```powershell
docker compose logs -f backend
```

or:

```powershell
docker compose logs -f frontend
```

## Step 7 — Stop the application

```powershell
docker compose down
```

## Reset the database

To stop the containers and remove Docker volumes:

```powershell
docker compose down -v
```

> **Warning:** `docker compose down -v` removes the SQL Server volume and therefore resets the database stored in that Docker volume.

After that, start again with:

```powershell
docker compose up -d --build
```

---

# 9. First Use

After the containers are running:

1. Open `http://localhost`.
2. Log in with a valid user account.
3. Depending on the user's role, the corresponding dashboard and menus are displayed.
4. Admin users can configure departments, job positions, users, criteria, evaluation periods and evaluator assignments.
5. Evaluators can evaluate employees assigned to them.
6. Employees can view their own evaluation results and history.
7. Authorized users can access the available ranking and reporting features.

If the project is delivered with demo/seed data, use the credentials documented with that delivery package.

---

# 10. Running the Backend Locally

Docker is recommended for the complete application. For backend development without Docker:

```powershell
cd src/PerformanceEvaluationSystem.API
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

The local development URL depends on the configured ASP.NET Core launch profile.

Swagger is available under:

```text
/swagger
```

For example, if the application is running on HTTPS port `7170`:

```text
https://localhost:7170/swagger
```

> When running through Docker, use `http://localhost:8080/swagger` instead.

---

# 11. Running the Frontend Locally

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite normally starts the development server at:

```text
http://localhost:5173
```

The frontend must be configured to use the correct backend API URL for the selected environment.

---

# 12. Database & Migrations

The project uses SQL Server and Entity Framework Core migrations.

For local development, after configuring the database connection:

```powershell
dotnet ef database update
```

To create a new migration:

```powershell
dotnet ef migrations add <MigrationName>
```

Then apply it:

```powershell
dotnet ef database update
```

Database-related SQL scripts are also provided separately in the project delivery package where applicable.

---

# 13. API & Swagger

When the application is running with Docker:

```text
http://localhost:8080/swagger
```

Swagger/OpenAPI documents the available REST endpoints and allows authorized endpoints to be tested interactively.

Main API areas include:

- Authentication
- Users
- Criteria and categories
- Evaluation periods
- Evaluator–Employee assignments
- Evaluations
- Rankings
- Reports / Excel export

Protected endpoints require authentication with a valid JWT.

---

# 14. Testing

## Backend Tests

From the project root:

```powershell
dotnet test
```

This runs the backend unit and integration test suites.

## Frontend Tests

```powershell
cd frontend
npm run test
```

## Coverage

The backend coverage pipeline can be executed with:

```powershell
.\scripts\coverage.ps1
```

The project uses the coverage configuration under:

```text
coverage-config/
```

Generated coverage files should be treated as build/test artifacts rather than source files.

---

# 15. Test Results

The project includes a separate test report containing the detailed test strategy, scenarios and coverage results.

The latest backend test execution reported:

```text
131 / 131 integration tests passed
```

The reported backend/application coverage includes:

| Area | Line Coverage |
|---|---:|
| Overall | 80.6% |
| API | 88.7% |
| Application | 82.5% |
| Domain | 92.8% |
| Infrastructure | 64.2% |

For complete test results, coverage metrics and test scenarios, refer to the accompanying **Test Report** in the project delivery package.

---

# 16. Security Notes

The application implements several security controls:

- JWT-based authentication
- BCrypt password hashing
- Role-based authorization
- Resource-level authorization
- FluentValidation
- Login rate limiting
- Unique email constraints
- Soft-delete / active-state handling
- Protected API endpoints

The login endpoint uses a fixed-window rate limiter:

```text
Maximum: 5 requests
Window: 1 minute
Scope: IP address
```

This configuration is intended for the current deployment model. A horizontally scaled production deployment would require a distributed rate-limiting strategy.

---

# 17. Additional Documentation

The complete project delivery package includes:

- **ER Diagram**
- **.NET 8 Web API / Swagger Documentation**
- **SQL Database Scripts**
- **User Manual**
- **Test Report**
- **Source Code**
- **Project README**

These documents describe the system from architectural, technical, operational and user perspectives.

---

# 18. Future Improvements

Possible future enhancements include:

- Email or push notifications
- PDF report export
- Audit logging for configuration changes
- More configurable evaluation templates
- Distributed rate limiting for multi-instance deployments
- Additional reporting and analytics capabilities

---

# 19. Key Concepts Demonstrated

```text
.NET 8 / ASP.NET Core Web API
Onion Architecture
Entity Framework Core
SQL Server
JWT Authentication
Role-Based Access Control
Resource-Level Authorization
FluentValidation
AutoMapper
React
TypeScript
Vite
Material UI
Zustand
Axios
Protected Routes
Internationalization (i18n)
Weighted Scoring
Excel Reporting
xUnit
Integration Testing
Vitest
React Testing Library
Code Coverage
Docker
Docker Compose
Nginx
Swagger / OpenAPI
```

---

# 20. Author

**Öykü Eyüboğlu**

**VakıfBank 360 — Performance Evaluation System**
