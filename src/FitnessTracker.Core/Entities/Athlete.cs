namespace FitnessTracker.Core.Entities;

public class Athlete
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public ICollection<ProgressPhoto> ProgressPhotos { get; set; } = new List<ProgressPhoto>();
}
