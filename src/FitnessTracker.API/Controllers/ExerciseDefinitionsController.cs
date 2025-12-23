using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExerciseDefinitionsController : ControllerBase
{
    private readonly IWorkoutRepository _workoutRepository;
    private readonly ILogger<ExerciseDefinitionsController> _logger;

    public ExerciseDefinitionsController(IWorkoutRepository workoutRepository, ILogger<ExerciseDefinitionsController> logger)
    {
        _workoutRepository = workoutRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExerciseDefinitionDto>>> GetDefinitions()
    {
        var definitions = await _workoutRepository.GetDefinitionsAsync();
        return Ok(definitions.Select(d => new ExerciseDefinitionDto
        {
            Id = d.Id,
            Name = d.Name,
            PrimaryMuscleGroup = d.PrimaryMuscleGroup,
            Description = d.Description
        }));
    }
}

public record ExerciseDefinitionDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string PrimaryMuscleGroup { get; init; } = string.Empty;
    public string? Description { get; init; }
}
