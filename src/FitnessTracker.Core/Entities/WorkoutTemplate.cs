namespace FitnessTracker.Core.Entities;

public class WorkoutTemplate
{
    public int Id { get; set; }
    public int AthleteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Athlete Athlete { get; set; } = null!;
    public ICollection<TemplateExercise> Exercises { get; set; } = new List<TemplateExercise>();
}
