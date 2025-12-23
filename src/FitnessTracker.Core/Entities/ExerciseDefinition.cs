namespace FitnessTracker.Core.Entities;

public class ExerciseDefinition
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PrimaryMuscleGroup { get; set; } = string.Empty; // e.g., Chest, Back, Legs
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for exercises that use this definition
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
