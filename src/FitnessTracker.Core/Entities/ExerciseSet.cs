namespace FitnessTracker.Core.Entities;

public class ExerciseSet
{
    public int Id { get; set; }
    public int ExerciseId { get; set; }
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? Weight { get; set; }

    // Navigation property
    public Exercise Exercise { get; set; } = null!;
}
