using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FitnessTracker.Infrastructure.Repositories;

public class WorkoutTemplateRepository : IWorkoutTemplateRepository
{
    private readonly FitnessDbContext _context;

    public WorkoutTemplateRepository(FitnessDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WorkoutTemplate>> GetAllAsync(string userId)
    {
        return await _context.WorkoutTemplates
            .Where(t => t.UserId == userId)
            .Include(t => t.Exercises)
                .ThenInclude(e => e.ExerciseDefinition)
            .Include(t => t.Exercises)
                .ThenInclude(e => e.TargetSets)
            .OrderBy(t => t.Title)
            .ToListAsync();
    }

    public async Task<WorkoutTemplate?> GetByIdAsync(int id)
    {
        return await _context.WorkoutTemplates
            .Include(t => t.Exercises)
                .ThenInclude(e => e.ExerciseDefinition)
            .Include(t => t.Exercises)
                .ThenInclude(e => e.TargetSets)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<WorkoutTemplate> CreateAsync(WorkoutTemplate template)
    {
        _context.WorkoutTemplates.Add(template);
        await _context.SaveChangesAsync();
        return template;
    }

    public async Task<WorkoutTemplate> UpdateAsync(WorkoutTemplate template)
    {
        // Simple implementation for now - delete and recreate exercises/sets to avoid complexity
        var existing = await _context.WorkoutTemplates
            .Include(t => t.Exercises)
                .ThenInclude(e => e.TargetSets)
            .FirstOrDefaultAsync(t => t.Id == template.Id);

        if (existing == null) throw new KeyNotFoundException("Template not found");

        existing.Title = template.Title;
        existing.Description = template.Description;

        _context.TemplateExercises.RemoveRange(existing.Exercises);
        existing.Exercises = template.Exercises;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task DeleteAsync(int id)
    {
        var template = await _context.WorkoutTemplates.FindAsync(id);
        if (template != null)
        {
            _context.WorkoutTemplates.Remove(template);
            await _context.SaveChangesAsync();
        }
    }
}
