using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FitnessTracker.Infrastructure.Repositories;

public class WorkoutRepository : IWorkoutRepository
{
    private readonly FitnessDbContext _context;
    private readonly ILogger<WorkoutRepository> _logger;

    public WorkoutRepository(FitnessDbContext context, ILogger<WorkoutRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Workout>> GetAllAsync(int athleteId)
    {
        return await _context.Workouts
            .Where(w => w.AthleteId == athleteId)
            .Include(w => w.Exercises)
                .ThenInclude(e => e.ExerciseDefinition)
            .Include(w => w.Exercises)
                .ThenInclude(e => e.Sets)
            .OrderByDescending(w => w.WorkoutDate)
            .ToListAsync();
    }

    public async Task<Workout?> GetByIdAsync(int id)
    {
        return await _context.Workouts
            .Include(w => w.Exercises)
                .ThenInclude(e => e.ExerciseDefinition)
            .Include(w => w.Exercises)
                .ThenInclude(e => e.Sets)
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<Workout> CreateAsync(Workout workout)
    {
        try
        {
            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            // Reload the workout with all nested entities to ensure IDs are populated
            return await GetByIdAsync(workout.Id) ?? workout;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error creating workout: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<Workout> UpdateAsync(Workout workout)
    {
        try
        {
            var existingWorkout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.Id == workout.Id) ?? throw new ArgumentException("Workout not found");

            // Update scalar properties
            existingWorkout.Description = workout.Description;
            existingWorkout.WorkoutDate = workout.WorkoutDate;

            // Delete existing exercises by ID (avoids EF tracking issues)
            var existingExerciseIds = await _context.Exercises
                .Where(e => e.WorkoutId == workout.Id)
                .Select(e => e.Id)
                .ToListAsync();

            if (existingExerciseIds.Any())
            {
                await _context.Database.ExecuteSqlRawAsync(
                    $"DELETE FROM \"Exercises\" WHERE \"WorkoutId\" = {workout.Id}");
            }

            // Add new exercises
            foreach (var exercise in workout.Exercises)
            {
                exercise.WorkoutId = workout.Id;
                _context.Exercises.Add(exercise);
            }

            await _context.SaveChangesAsync();

            // Reload with all relations
            return await GetByIdAsync(workout.Id) ?? existingWorkout;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error updating workout: {Message}", ex.Message);
            throw;
        }
    }

    public async Task DeleteAsync(int id)
    {
        try
        {
            var workout = await _context.Workouts.FindAsync(id);
            if (workout != null)
            {
                _context.Workouts.Remove(workout);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error deleting workout: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<IEnumerable<ExerciseDefinition>> GetDefinitionsAsync()
    {
        return await _context.ExerciseDefinitions
            .Include(ed => ed.Category)
            .OrderBy(ed => ed.Name)
            .ToListAsync();
    }

    public async Task<ExerciseDefinition?> GetDefinitionByIdAsync(int id)
    {
        return await _context.ExerciseDefinitions
            .Include(ed => ed.Category)
            .FirstOrDefaultAsync(ed => ed.Id == id);
    }

    public async Task<ExerciseDefinition> CreateDefinitionAsync(ExerciseDefinition definition)
    {
        try
        {
            _context.ExerciseDefinitions.Add(definition);
            await _context.SaveChangesAsync();

            // Reload to include category
            return await GetDefinitionByIdAsync(definition.Id)
                ?? throw new InvalidOperationException("Failed to retrieve created definition");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error creating exercise definition: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<ExerciseDefinition> UpdateDefinitionAsync(ExerciseDefinition definition)
    {
        try
        {
            var existing = await _context.ExerciseDefinitions.FindAsync(definition.Id);
            if (existing == null)
            {
                throw new ArgumentException("Exercise definition not found");
            }

            existing.Name = definition.Name;
            existing.PrimaryMuscleGroup = definition.PrimaryMuscleGroup;
            existing.Description = definition.Description;
            existing.CategoryId = definition.CategoryId;

            await _context.SaveChangesAsync();

            // Reload to include category
            return await GetDefinitionByIdAsync(definition.Id)
                ?? throw new InvalidOperationException("Failed to retrieve updated definition");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error updating exercise definition: {Message}", ex.Message);
            throw;
        }
    }

    public async Task DeleteDefinitionAsync(int id)
    {
        try
        {
            var definition = await _context.ExerciseDefinitions.FindAsync(id);
            if (definition != null)
            {
                _context.ExerciseDefinitions.Remove(definition);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error deleting exercise definition: {Message}", ex.Message);
            throw;
        }
    }

    // Category methods
    public async Task<IEnumerable<ExerciseDefinitionCategory>> GetCategoriesAsync()
    {
        return await _context.ExerciseDefinitionCategories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<ExerciseDefinitionCategory?> GetCategoryByIdAsync(int id)
    {
        return await _context.ExerciseDefinitionCategories.FindAsync(id);
    }

    public async Task<ExerciseDefinitionCategory> CreateCategoryAsync(ExerciseDefinitionCategory category)
    {
        try
        {
            _context.ExerciseDefinitionCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error creating exercise category: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<ExerciseDefinitionCategory> UpdateCategoryAsync(ExerciseDefinitionCategory category)
    {
        try
        {
            var existing = await _context.ExerciseDefinitionCategories.FindAsync(category.Id);
            if (existing == null)
            {
                throw new ArgumentException("Exercise category not found");
            }

            existing.Name = category.Name;
            existing.Description = category.Description;

            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error updating exercise category: {Message}", ex.Message);
            throw;
        }
    }

    public async Task DeleteCategoryAsync(int id)
    {
        try
        {
            var category = await _context.ExerciseDefinitionCategories.FindAsync(id);
            if (category != null)
            {
                _context.ExerciseDefinitionCategories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error deleting exercise category: {Message}", ex.Message);
            throw;
        }
    }
}
