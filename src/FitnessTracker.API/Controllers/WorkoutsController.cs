using System.Security.Claims;
using FitnessTracker.API.Filters;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutRepository _workoutRepository;
    private readonly IWorkoutTemplateRepository _templateRepository;
    private readonly FitnessDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<WorkoutsController> _logger;

    public WorkoutsController(
        IWorkoutRepository workoutRepository,
        IWorkoutTemplateRepository templateRepository,
        FitnessDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<WorkoutsController> logger)
    {
        _workoutRepository = workoutRepository;
        _templateRepository = templateRepository;
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutDto>>> GetWorkouts()
    {
        var userId = GetUserId();
        var workouts = await _workoutRepository.GetAllAsync(userId);
        var dtos = new List<WorkoutDto>();
        foreach (var workout in workouts)
        {
            dtos.Add(await MapToDtoAsync(workout));
        }
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [ValidateResourceOwnership]
    public async Task<ActionResult<WorkoutDto>> GetWorkout(int id)
    {
        var workout = await _workoutRepository.GetByIdAsync(id);
        if (workout == null)
        {
            return NotFound();
        }
        return Ok(await MapToDtoAsync(workout));
    }

    [HttpPost("from-template/{templateId}")]
    public async Task<ActionResult<WorkoutDto>> CreateFromTemplate(int templateId)
    {
        var template = await _templateRepository.GetByIdAsync(templateId);
        if (template == null) return NotFound("Template not found");

        var userId = GetUserId();
        var workout = new Workout
        {
            UserId = userId,
            Title = template.Title,
            Description = template.Description,
            WorkoutDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
            Exercises = template.Exercises.Select(te => new Exercise
            {
                ExerciseDefinitionId = te.ExerciseDefinitionId,
                Notes = te.Notes,
                Sets = te.TargetSets.Select(ts => new ExerciseSet
                {
                    SetNumber = ts.SetNumber,
                    Reps = ts.TargetReps,
                    Weight = ts.TargetWeight
                }).ToList()
            }).ToList()
        };

        var created = await _workoutRepository.CreateAsync(workout);
        return CreatedAtAction(nameof(GetWorkout), new { id = created.Id }, await MapToDtoAsync(created));
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateWorkout(CreateWorkoutRequest request)
    {
        var workoutDate = DateTime.SpecifyKind(request.WorkoutDate, DateTimeKind.Utc);

        var userId = GetUserId();
        var workout = new Workout
        {
            UserId = userId,
            Title = "",  // No title needed - date is displayed in UI
            Description = request.Description,
            DurationMinutes = 0,  // Duration not tracked for individual workouts
            WorkoutDate = workoutDate,
            Exercises = request.Exercises.Select(e =>
            {
                return new Exercise
                {
                    ExerciseDefinitionId = e.ExerciseDefinitionId,
                    Notes = e.Notes,
                    Sets = e.Sets.Select(s =>
                    {
                        var weight = s.Weight.HasValue ? Math.Round(s.Weight.Value, 2) : (decimal?)null;
                        if (weight > 2000)
                        {
                            throw new ArgumentException("Weight cannot exceed 2000 lbs");
                        }
                        return new ExerciseSet
                        {
                            SetNumber = s.SetNumber,
                            Reps = s.Reps,
                            Weight = weight
                        };
                    }).ToList()
                };
            }).ToList()
        };

        try
        {
            var created = await _workoutRepository.CreateAsync(workout);
            _logger.LogInformation("Created workout {WorkoutId}: {Title}", created.Id, created.Title);

            // PRs are calculated at runtime in MapToDtoAsync
            return CreatedAtAction(nameof(GetWorkout), new { id = created.Id }, await MapToDtoAsync(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [ValidateResourceOwnership]
    public async Task<ActionResult<WorkoutDto>> UpdateWorkout(int id, UpdateWorkoutRequest request)
    {
        var existing = await _workoutRepository.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        var workoutDate = DateTime.SpecifyKind(request.WorkoutDate, DateTimeKind.Utc);

        // Create a new workout object with the updated data
        var updatedWorkout = new Workout
        {
            Id = id,
            UserId = existing.UserId,
            Title = "",  // No title needed - date is displayed in UI
            Description = request.Description,
            DurationMinutes = 0,  // Duration not tracked for individual workouts
            WorkoutDate = workoutDate,
            CreatedAt = existing.CreatedAt,
            Exercises = request.Exercises.Select(e =>
            {
                return new Exercise
                {
                    ExerciseDefinitionId = e.ExerciseDefinitionId,
                    Notes = e.Notes,
                    Sets = e.Sets.Select(s =>
                    {
                        var weight = s.Weight.HasValue ? Math.Round(s.Weight.Value, 2) : (decimal?)null;
                        if (weight > 2000)
                        {
                            throw new ArgumentException("Weight cannot exceed 2000 lbs");
                        }
                        return new ExerciseSet
                        {
                            SetNumber = s.SetNumber,
                            Reps = s.Reps,
                            Weight = weight
                        };
                    }).ToList()
                };
            }).ToList()
        };

        try
        {
            var updated = await _workoutRepository.UpdateAsync(updatedWorkout);

            // TODO: Re-enable PR detection once per-set save frontend is complete
            // await _prService.DetectAndCreatePRsAsync(DefaultAthleteId, updated);

            return Ok(await MapToDtoAsync(updated));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [ValidateResourceOwnership]
    public async Task<IActionResult> DeleteWorkout(int id)
    {
        var existing = await _workoutRepository.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        await _workoutRepository.DeleteAsync(id);
        return NoContent();
    }

    // Individual Set Operations
    [HttpPost("{workoutId}/exercises/{exerciseId}/sets")]
    public async Task<ActionResult<SetDto>> AddSet(int workoutId, int exerciseId, CreateSetRequest request)
    {
        var workout = await _workoutRepository.GetByIdAsync(workoutId);
        if (workout == null) return NotFound("Workout not found");

        var exercise = workout.Exercises.FirstOrDefault(e => e.Id == exerciseId);
        if (exercise == null) return NotFound("Exercise not found");

        var weight = request.Weight.HasValue ? Math.Round(request.Weight.Value, 2) : (decimal?)null;
        if (weight > 2000)
        {
            return BadRequest("Weight cannot exceed 2000 lbs");
        }

        var newSet = new ExerciseSet
        {
            ExerciseId = exerciseId,
            SetNumber = request.SetNumber,
            Reps = request.Reps,
            Weight = weight
        };

        exercise.Sets.Add(newSet);
        await _context.SaveChangesAsync();

        // PRs are calculated at runtime when loading workouts, no need to detect here
        return Ok(new SetDto
        {
            Id = newSet.Id,
            SetNumber = newSet.SetNumber,
            Reps = newSet.Reps,
            Weight = newSet.Weight,
            IsPR = false // Will be calculated when workout is reloaded
        });
    }

    [HttpPut("{workoutId}/exercises/{exerciseId}/sets/{setId}")]
    public async Task<ActionResult<SetDto>> UpdateSet(int workoutId, int exerciseId, int setId, CreateSetRequest request)
    {
        var workout = await _workoutRepository.GetByIdAsync(workoutId);
        if (workout == null) return NotFound("Workout not found");

        var exercise = workout.Exercises.FirstOrDefault(e => e.Id == exerciseId);
        if (exercise == null) return NotFound("Exercise not found");

        var set = exercise.Sets.FirstOrDefault(s => s.Id == setId);
        if (set == null) return NotFound("Set not found");

        var weight = request.Weight.HasValue ? Math.Round(request.Weight.Value, 2) : (decimal?)null;
        if (weight > 2000)
        {
            return BadRequest("Weight cannot exceed 2000 lbs");
        }

        set.SetNumber = request.SetNumber;
        set.Reps = request.Reps;
        set.Weight = weight;

        await _context.SaveChangesAsync();

        // PRs are calculated at runtime when loading workouts
        return Ok(new SetDto
        {
            Id = set.Id,
            SetNumber = set.SetNumber,
            Reps = set.Reps,
            Weight = set.Weight,
            IsPR = false // Will be calculated when workout is reloaded
        });
    }

    [HttpDelete("{workoutId}/exercises/{exerciseId}/sets/{setId}")]
    public async Task<IActionResult> DeleteSet(int workoutId, int exerciseId, int setId)
    {
        var workout = await _workoutRepository.GetByIdAsync(workoutId);
        if (workout == null) return NotFound("Workout not found");

        var exercise = workout.Exercises.FirstOrDefault(e => e.Id == exerciseId);
        if (exercise == null) return NotFound("Exercise not found");

        var set = exercise.Sets.FirstOrDefault(s => s.Id == setId);
        if (set == null) return NotFound("Set not found");

        exercise.Sets.Remove(set);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<WorkoutDto> MapToDtoAsync(Workout workout)
    {
        var exercises = new List<ExerciseDto>();

        foreach (var e in workout.Exercises)
        {
            // Get the PR set IDs for this exercise using efficient SQL aggregation
            // This finds the set with max weight per rep count (oldest ID wins ties)
            var prSetIds = await _context.ExerciseSets
                .Include(s => s.Exercise)
                .Where(s => s.Exercise.ExerciseDefinitionId == e.ExerciseDefinitionId &&
                           s.Exercise.Workout.UserId == GetUserId() &&
                           s.Weight != null && s.Reps != null && s.Reps > 0)
                .GroupBy(s => s.Reps)
                .Select(g => g.OrderByDescending(s => s.Weight).ThenBy(s => s.Id).First().Id)
                .ToListAsync();

            var prSetIdSet = prSetIds.ToHashSet();

            var sets = new List<SetDto>();
            foreach (var s in e.Sets.OrderBy(x => x.SetNumber))
            {
                sets.Add(new SetDto
                {
                    Id = s.Id,
                    SetNumber = s.SetNumber,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    IsPR = s.Id > 0 && prSetIdSet.Contains(s.Id)
                });
            }

            exercises.Add(new ExerciseDto
            {
                Id = e.Id,
                ExerciseDefinitionId = e.ExerciseDefinitionId,
                ExerciseName = e.ExerciseDefinition?.Name ?? "Unknown",
                Notes = e.Notes,
                Sets = sets
            });
        }

        return new WorkoutDto
        {
            Id = workout.Id,
            Title = workout.Title,
            Description = workout.Description,
            DurationMinutes = workout.DurationMinutes,
            WorkoutDate = workout.WorkoutDate,
            CreatedAt = workout.CreatedAt,
            Exercises = exercises
        };
    }
}

// DTOs
public record WorkoutDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DurationMinutes { get; init; }
    public DateTime WorkoutDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<ExerciseDto> Exercises { get; init; } = new();
}

public record ExerciseDto
{
    public int Id { get; init; }
    public int ExerciseDefinitionId { get; init; }
    public string ExerciseName { get; init; } = string.Empty;
    public List<SetDto> Sets { get; init; } = new();
    public string? Notes { get; init; }
}

public record SetDto
{
    public int Id { get; init; }
    public int SetNumber { get; init; }
    public int? Reps { get; init; }
    public decimal? Weight { get; init; }
    public bool IsPR { get; init; }
}

public record CreateWorkoutRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DurationMinutes { get; init; }
    public DateTime WorkoutDate { get; init; }
    public List<CreateExerciseRequest> Exercises { get; init; } = new();
}

public record UpdateWorkoutRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DurationMinutes { get; init; }
    public DateTime WorkoutDate { get; init; }
    public List<CreateExerciseRequest> Exercises { get; init; } = new();
}

public record CreateExerciseRequest
{
    public int ExerciseDefinitionId { get; init; }
    public List<CreateSetRequest> Sets { get; init; } = new();
    public string? Notes { get; init; }
}

public record CreateSetRequest
{
    public int SetNumber { get; init; }
    public int? Reps { get; init; }
    public decimal? Weight { get; init; }
}
