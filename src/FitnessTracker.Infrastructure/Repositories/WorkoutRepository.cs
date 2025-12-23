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
            return workout;
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
                .Include(w => w.Exercises)
                    .ThenInclude(e => e.Sets)
                .FirstOrDefaultAsync(w => w.Id == workout.Id);

            if (existingWorkout == null)
            {
                throw new ArgumentException("Workout not found");
            }

            // Update scalar properties
            existingWorkout.Title = workout.Title;
            existingWorkout.Description = workout.Description;
            existingWorkout.DurationMinutes = workout.DurationMinutes;
            existingWorkout.WorkoutDate = workout.WorkoutDate;

            // Remove existing exercises (and their sets via cascade)
            _context.Exercises.RemoveRange(existingWorkout.Exercises);

            // Add new exercises
            foreach (var exercise in workout.Exercises)
            {
                exercise.WorkoutId = workout.Id;
                existingWorkout.Exercises.Add(exercise);
            }

            await _context.SaveChangesAsync();
            return existingWorkout;
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
            .OrderBy(ed => ed.Name)
            .ToListAsync();
    }
}
