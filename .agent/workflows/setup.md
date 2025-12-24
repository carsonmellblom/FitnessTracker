---
description: Initial setup for FitnessTracker (first-time configuration)
---

Run this workflow once to set up FitnessTracker for the first time.

## Step 1: Verify RabbitMQ is running

```powershell
docker ps
```

If not running, start it:
```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```

## Step 5: Build the solution

// turbo
```powershell
cd d:\dev\FitnessTracker
dotnet build
```

Setup complete! Now use `/start-all` to launch the application.