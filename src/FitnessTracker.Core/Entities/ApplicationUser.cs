using Microsoft.AspNetCore.Identity;

namespace FitnessTracker.Core.Entities;

public class ApplicationUser : IdentityUser
{
    // UserName is already available from IdentityUser base class
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Refresh token for JWT authentication
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation properties
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public ICollection<ProgressPhoto> ProgressPhotos { get; set; } = new List<ProgressPhoto>();
    public ICollection<WorkoutTemplate> WorkoutTemplates { get; set; } = new List<WorkoutTemplate>();
}
