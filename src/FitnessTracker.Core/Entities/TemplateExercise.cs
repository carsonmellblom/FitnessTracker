namespace FitnessTracker.Core.Entities;

public class TemplateExercise
{
    public int Id { get; set; }
    public int WorkoutTemplateId { get; set; }
    public int ExerciseDefinitionId { get; set; }
    public int SortOrder { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public WorkoutTemplate WorkoutTemplate { get; set; } = null!;
    public ExerciseDefinition ExerciseDefinition { get; set; } = null!;
    public ICollection<TemplateSet> TargetSets { get; set; } = new List<TemplateSet>();
}
