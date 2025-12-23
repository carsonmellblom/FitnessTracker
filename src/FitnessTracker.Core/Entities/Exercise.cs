namespace FitnessTracker.Core.Entities;

public class Exercise
{
    public int Id { get; set; }
    public int WorkoutId { get; set; }
    public int ExerciseDefinitionId { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Workout Workout { get; set; } = null!;
    public ExerciseDefinition ExerciseDefinition { get; set; } = null!;
    public ICollection<ExerciseSet> Sets { get; set; } = new List<ExerciseSet>();
}
