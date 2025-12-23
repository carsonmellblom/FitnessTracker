namespace FitnessTracker.Core.Entities;

public class ExerciseDefinition
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PrimaryMuscleGroup { get; set; } = string.Empty; // e.g., Chest, Back, Legs
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ExerciseDefinitionCategory? Category { get; set; }
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
