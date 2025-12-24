---
description: Restart the .NET API (kills existing process and starts fresh)
---
// turbo-all

Restart the FitnessTracker API:

1. Stop any running FitnessTracker.API process and start fresh:
```powershell
Get-Process -Name "FitnessTracker.API" -ErrorAction SilentlyContinue | Stop-Process -Force; cd d:\dev\FitnessTracker\src\FitnessTracker.API; dotnet run
```

The API will be available at:
- API: http://localhost:5067
- Swagger: http://localhost:5067/swagger
