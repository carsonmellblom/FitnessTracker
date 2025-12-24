---
description: Start the Python photo processor Docker container
---
// turbo-all

Start the photo processing microservice:

1. Build and start the photo processor container:
```powershell
cd d:\dev\FitnessTracker
docker-compose up photo-processor
```

Note: Make sure you have created a `.env` file with your DB_PASSWORD first (copy from `.env.template`).
