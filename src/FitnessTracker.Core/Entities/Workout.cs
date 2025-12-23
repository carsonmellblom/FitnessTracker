namespace FitnessTracker.Core.Entities;

public class Workout
{
    public int Id { get; set; }
    public int AthleteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime WorkoutDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Athlete Athlete { get; set; } = null!;
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
