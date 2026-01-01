using System.Text;
using FitnessTracker.Core.Config;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using FitnessTracker.Infrastructure.Messaging;
using FitnessTracker.Infrastructure.Repositories;
using FitnessTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using FitnessTracker.API.Middleware;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using RabbitMQ.Client;




var builder = WebApplication.CreateBuilder(args);

// No manual URL configuration needed - allows default container ports (8080) to work

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();


// Add API versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Asp.Versioning.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new Asp.Versioning.UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Configure database
builder.Services.AddDbContext<FitnessDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 10;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

    // User settings
    options.User.RequireUniqueEmail = true;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<FitnessDbContext>()
.AddDefaultTokenProviders();

// Configure JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

var secret = jwtSettings.Get<JwtSettings>()?.Secret ?? throw new InvalidOperationException("JWT Secret not configured");
var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Get<JwtSettings>()?.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Get<JwtSettings>()?.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // For httpOnly cookie support
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Check for token in cookie first
            if (context.Request.Cookies.ContainsKey("accessToken"))
            {
                context.Token = context.Request.Cookies["accessToken"];
            }
            return Task.CompletedTask;
        }
    };
});

// Register repositories
builder.Services.AddScoped<IWorkoutRepository, WorkoutRepository>();
builder.Services.AddScoped<IWorkoutTemplateRepository, WorkoutTemplateRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();

// Register services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Register RabbitMQ publisher, add as a singleton because we want to use the same connection for the entire application
builder.Services.AddSingleton<IMessagePublisher, RabbitMqPublisher>();

// Register File Storage - Use Blob if Azure connection string present, otherwise local
if (!string.IsNullOrEmpty(builder.Configuration["AzureStorage:ConnectionString"]))
{
    builder.Services.AddSingleton<IFileStorageService, BlobStorageService>();
}
else
{
    builder.Services.AddSingleton<IFileStorageService, LocalFileStorageService>();
}



// Get the origins from appsettings.json, if null, pass in an empty array
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins) // Use the array from config
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for cookie authentication
    });
});

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("fixed", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 5;
    });
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddRabbitMQ(async sp =>
    {
        var config = sp.GetRequiredService<IConfiguration>();
        var factory = new ConnectionFactory
        {
            HostName = config["RabbitMQ:Host"]!,
            Port = int.Parse(config["RabbitMQ:Port"]!),
            UserName = config["RabbitMQ:Username"]!,
            Password = config["RabbitMQ:Password"]!
        };
        return await factory.CreateConnectionAsync();
    }, name: "RabbitMQ");


var app = builder.Build();

app.UseExceptionHandler();

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Production Security Headers
    app.UseHsts();
}

// Add Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:;"); // Allow images from self, data (base64), and https sources
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()"); // Disable unused features
    await next();
});

app.UseRateLimiter(); // Use Rate Limiter middleware
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Serve static files for uploaded photos
app.UseStaticFiles();

// Serve uploaded photos from the /uploads path
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath); // Ensure folder exists
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.MapControllers().RequireRateLimiting("fixed");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                check = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            }),
            totalDuration = report.TotalDuration
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});


// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FitnessDbContext>();
    db.Database.Migrate();
}

app.Run();
