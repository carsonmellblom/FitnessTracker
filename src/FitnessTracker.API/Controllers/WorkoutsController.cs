using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutRepository _workoutRepository;
    private readonly IWorkoutTemplateRepository _templateRepository;
    private readonly ILogger<WorkoutsController> _logger;

    // Default athlete ID (no auth for now)
    private const int DefaultAthleteId = 1;

    public WorkoutsController(IWorkoutRepository workoutRepository, IWorkoutTemplateRepository templateRepository, ILogger<WorkoutsController> logger)
    {
        _workoutRepository = workoutRepository;
        _templateRepository = templateRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutDto>>> GetWorkouts()
    {
        var workouts = await _workoutRepository.GetAllAsync(DefaultAthleteId);
        return Ok(workouts.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutDto>> GetWorkout(int id)
    {
        var workout = await _workoutRepository.GetByIdAsync(id);
        if (workout == null)
        {
            return NotFound();
        }
        return Ok(MapToDto(workout));
    }

    [HttpPost("from-template/{templateId}")]
    public async Task<ActionResult<WorkoutDto>> CreateFromTemplate(int templateId)
    {
        var template = await _templateRepository.GetByIdAsync(templateId);
        if (template == null) return NotFound("Template not found");

        var workout = new Workout
        {
            AthleteId = DefaultAthleteId,
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
        return CreatedAtAction(nameof(GetWorkout), new { id = created.Id }, MapToDto(created));
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateWorkout(CreateWorkoutRequest request)
    {
        var workout = new Workout
        {
            AthleteId = DefaultAthleteId,
            Title = request.Title,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes,
            WorkoutDate = DateTime.SpecifyKind(request.WorkoutDate, DateTimeKind.Utc),
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
            return CreatedAtAction(nameof(GetWorkout), new { id = created.Id }, MapToDto(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkoutDto>> UpdateWorkout(int id, UpdateWorkoutRequest request)
    {
        var existing = await _workoutRepository.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.DurationMinutes = request.DurationMinutes;
        existing.WorkoutDate = DateTime.SpecifyKind(request.WorkoutDate, DateTimeKind.Utc);
        existing.Exercises = request.Exercises.Select(e =>
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
        }).ToList();

        try
        {
            var updated = await _workoutRepository.UpdateAsync(existing);
            return Ok(MapToDto(updated));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
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

    private static WorkoutDto MapToDto(Workout workout) => new()
    {
        Id = workout.Id,
        Title = workout.Title,
        Description = workout.Description,
        DurationMinutes = workout.DurationMinutes,
        WorkoutDate = workout.WorkoutDate,
        CreatedAt = workout.CreatedAt,
        Exercises = workout.Exercises.Select(e => new ExerciseDto
        {
            Id = e.Id,
            ExerciseDefinitionId = e.ExerciseDefinitionId,
            ExerciseName = e.ExerciseDefinition?.Name ?? "Unknown",
            Notes = e.Notes,
            Sets = e.Sets.Select(s => new SetDto
            {
                Id = s.Id,
                SetNumber = s.SetNumber,
                Reps = s.Reps,
                Weight = s.Weight
            }).OrderBy(s => s.SetNumber).ToList()
        }).ToList()
    };
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
