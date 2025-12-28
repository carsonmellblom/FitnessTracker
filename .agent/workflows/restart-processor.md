---
description: Rebuild and restart the photo processor container
---

Rebuild and restart the photo processor Docker container with updated code:

1. Stop the current photo processor (if running):
```powershell
docker-compose down photo-processor
```

// turbo
2. Rebuild the Docker image:
```powershell
cd d:\dev\FitnessTracker
docker-compose build photo-processor
```

// turbo
3. Start the updated container:
```powershell
docker-compose up photo-processor
```

Note: This is necessary when you make changes to the Python code in `services/photo-processor/` to ensure the Docker container uses the latest version.
