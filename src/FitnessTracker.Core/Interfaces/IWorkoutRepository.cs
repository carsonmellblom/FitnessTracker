using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface IWorkoutRepository
{
    Task<IEnumerable<Workout>> GetAllAsync(int athleteId);
    Task<Workout?> GetByIdAsync(int id);
    Task<Workout> CreateAsync(Workout workout);
    Task<Workout> UpdateAsync(Workout workout);
    Task DeleteAsync(int id);
    Task<IEnumerable<ExerciseDefinition>> GetDefinitionsAsync();
}
