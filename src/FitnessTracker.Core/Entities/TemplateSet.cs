namespace FitnessTracker.Core.Entities;

public class TemplateSet
{
    public int Id { get; set; }
    public int TemplateExerciseId { get; set; }
    public int SetNumber { get; set; }
    public int? TargetReps { get; set; }
    public decimal? TargetWeight { get; set; }

    // Navigation property
    public TemplateExercise TemplateExercise { get; set; } = null!;
}
