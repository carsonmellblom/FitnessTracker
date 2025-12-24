# FitnessTracker

A full-stack fitness tracking application for athletes to log workouts and track progress with photos.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  .NET Core API  │────▶│   PostgreSQL    │
│   (Vite)        │     │   (Port 5067)   │     │   (Port 5432)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │ Publish
                                 ▼
                        ┌─────────────────┐
                        │    RabbitMQ     │
                        │  (Port 5672)    │
                        └────────┬────────┘
                                 │ Consume
                                 ▼
                        ┌─────────────────┐
                        │ Python Photo    │
                        │ Processor       │
                        │ (Docker)        │
                        └─────────────────┘
```

## Prerequisites

- .NET 7 SDK
- Node.js 20+
- PostgreSQL (installed locally)
- RabbitMQ (Docker: `rabbitmq:4-management`)
- Docker Desktop

## Quick Start

### 1. Configure Database Connection

Copy the template and add your PostgreSQL password:

```bash
# Copy template
copy src\FitnessTracker.API\appsettings.Development.json.template src\FitnessTracker.API\appsettings.Development.json

# Edit appsettings.Development.json and replace YOUR_PASSWORD_HERE with your actual password
```

### 2. Create PostgreSQL Database

```sql
CREATE DATABASE fitness_tracker;
```

### 3. Start RabbitMQ (if not already running)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```

### 4. Run the .NET API

```bash
cd src\FitnessTracker.API
dotnet run
```

The API will be available at: `http://localhost:5067`
Swagger UI: `http://localhost:5067/swagger`

### 5. Run the React Frontend

```bash
cd src\FitnessTracker.Web
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 6. Start the Photo Processor

Create a `.env` file in the project root:

```bash
copy .env.template .env
# Edit .env and set your DB_PASSWORD
```

Then start the container:

```bash
docker-compose up photo-processor
```

## Project Structure

```
FitnessTracker/
├── src/
│   ├── FitnessTracker.API/          # ASP.NET Core Web API
│   │   ├── Controllers/             # REST endpoints
│   │   ├── appsettings.json         # Configuration
│   │   └── Program.cs               # Service setup
│   │
│   ├── FitnessTracker.Core/         # Domain layer
│   │   ├── Entities/                # Domain models
│   │   └── Interfaces/              # Repository contracts
│   │
│   ├── FitnessTracker.Infrastructure/
│   │   ├── Data/                    # EF Core DbContext
│   │   ├── Repositories/            # Data access
│   │   └── Messaging/               # RabbitMQ publisher
│   │
│   └── FitnessTracker.Web/          # React frontend
│       └── src/
│           ├── pages/               # Dashboard, Workouts, Photos
│           ├── services/            # API client
│           └── index.css            # Premium dark theme
│
├── services/
│   └── photo-processor/             # Python microservice
│       ├── main.py                  # RabbitMQ consumer
│       ├── processor.py             # Image processing
│       └── Dockerfile               # Container build
│
└── docker-compose.yml               # Development orchestration
```

## Features

### Workout Logging
- Create, edit, and delete workouts
- Track exercises with sets, reps, and weight
- View workout history

### Progress Photos
- Upload photos (JPEG, PNG, WebP)
- Automatic thumbnail generation
- Body composition analysis
- Processing status tracking

### Photo Processing (Python Microservice)
- **Thumbnail generation**: Creates 300x300 thumbnails
- **Quality analysis**: Brightness, contrast, resolution scoring
- **Body detection**: Skin tone detection for progress photos
- **Recommendations**: Tips for better progress photos

## API Endpoints

### Workouts
- `GET /api/workouts` - List all workouts
- `GET /api/workouts/{id}` - Get workout details
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout

### Photos
- `GET /api/photos` - List all photos
- `GET /api/photos/{id}` - Get photo details
- `POST /api/photos` - Upload photo (multipart/form-data)
- `DELETE /api/photos/{id}` - Delete photo

## Development

### Run Database Migrations

```bash
dotnet ef database update --project src\FitnessTracker.Infrastructure --startup-project src\FitnessTracker.API
```

### Build All Projects

```bash
dotnet build
```

### Run Tests

```bash
dotnet test
```

## Troubleshooting

### RabbitMQ Connection Issues
- Ensure RabbitMQ container is running: `docker ps`
- Check RabbitMQ management UI: http://localhost:15672 (guest/guest)

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in appsettings.Development.json
- Ensure `fitness_tracker` database exists

### Photo Processing Not Working
- Check Docker container logs: `docker-compose logs photo-processor`
- Verify uploads folder is mounted correctly
- Check RabbitMQ queue: http://localhost:15672/#/queues


