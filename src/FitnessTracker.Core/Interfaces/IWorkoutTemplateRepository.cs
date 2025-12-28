using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface IWorkoutTemplateRepository
{
    Task<IEnumerable<WorkoutTemplate>> GetAllAsync(string userId);
    Task<WorkoutTemplate?> GetByIdAsync(int id);
    Task<WorkoutTemplate> CreateAsync(WorkoutTemplate template);
    Task<WorkoutTemplate> UpdateAsync(WorkoutTemplate template);
    Task DeleteAsync(int id);
}
