using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface IWorkoutRepository
{
    Task<IEnumerable<Workout>> GetAllAsync(string userId);
    Task<Workout?> GetByIdAsync(int id);
    Task<Workout> CreateAsync(Workout workout);
    Task<Workout> UpdateAsync(Workout workout);
    Task DeleteAsync(int id);

    // Exercise Definitions
    Task<IEnumerable<ExerciseDefinition>> GetDefinitionsAsync();
    Task<ExerciseDefinition?> GetDefinitionByIdAsync(int id);
    Task<ExerciseDefinition> CreateDefinitionAsync(ExerciseDefinition definition);
    Task<ExerciseDefinition> UpdateDefinitionAsync(ExerciseDefinition definition);
    Task DeleteDefinitionAsync(int id);

    // Exercise Definition Categories
    Task<IEnumerable<ExerciseDefinitionCategory>> GetCategoriesAsync();
    Task<ExerciseDefinitionCategory?> GetCategoryByIdAsync(int id);
    Task<ExerciseDefinitionCategory> CreateCategoryAsync(ExerciseDefinitionCategory category);
    Task<ExerciseDefinitionCategory> UpdateCategoryAsync(ExerciseDefinitionCategory category);
    Task DeleteCategoryAsync(int id);
}
