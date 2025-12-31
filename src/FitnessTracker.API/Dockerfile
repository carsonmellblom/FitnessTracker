# Base stage for runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files first to cache restore
COPY ["src/FitnessTracker.API/FitnessTracker.API.csproj", "src/FitnessTracker.API/"]
COPY ["src/FitnessTracker.Core/FitnessTracker.Core.csproj", "src/FitnessTracker.Core/"]
COPY ["src/FitnessTracker.Infrastructure/FitnessTracker.Infrastructure.csproj", "src/FitnessTracker.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "./src/FitnessTracker.API/FitnessTracker.API.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/src/FitnessTracker.API"
RUN dotnet build "./FitnessTracker.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FitnessTracker.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final runtime stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FitnessTracker.API.dll"]
