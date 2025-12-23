namespace FitnessTracker.Core.Entities;

public class ExerciseDefinitionCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for exercise definitions in this category
    public ICollection<ExerciseDefinition> ExerciseDefinitions { get; set; } = new List<ExerciseDefinition>();
}
