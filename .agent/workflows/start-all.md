---
description: Start all FitnessTracker services (API, frontend, processor)
---

Start the complete FitnessTracker stack. This will launch each service in sequence.

**Prerequisites:**
- PostgreSQL running with `fitness_tracker` database
- RabbitMQ container running (`rabbitmq:4-management`)
- `appsettings.Development.json` configured with your password
- `.env` file created with DB_PASSWORD

## Step 1: Start the API
// turbo
```powershell
cd d:\dev\FitnessTracker\src\FitnessTracker.API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"
```

## Step 2: Start the Frontend
// turbo
```powershell
cd d:\dev\FitnessTracker\src\FitnessTracker.Web
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

## Step 3: Start the Photo Processor
// turbo
```powershell
cd d:\dev\FitnessTracker
Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker-compose up photo-processor"
```

After all services start:
- Frontend: http://localhost:5173
- API: http://localhost:5067
- Swagger: http://localhost:5067/swagger
