using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
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
            Description = d.Description,
            CategoryId = d.CategoryId,
            CategoryName = d.Category?.Name
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExerciseDefinitionDto>> GetDefinition(int id)
    {
        var definition = await _workoutRepository.GetDefinitionByIdAsync(id);
        if (definition == null)
        {
            return NotFound();
        }

        return Ok(new ExerciseDefinitionDto
        {
            Id = definition.Id,
            Name = definition.Name,
            PrimaryMuscleGroup = definition.PrimaryMuscleGroup,
            Description = definition.Description,
            CategoryId = definition.CategoryId,
            CategoryName = definition.Category?.Name
        });
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDefinitionDto>> CreateDefinition(CreateExerciseDefinitionDto dto)
    {
        try
        {
            var definition = new ExerciseDefinition
            {
                Name = dto.Name,
                PrimaryMuscleGroup = dto.PrimaryMuscleGroup,
                Description = dto.Description,
                CategoryId = dto.CategoryId
            };

            var created = await _workoutRepository.CreateDefinitionAsync(definition);

            var result = new ExerciseDefinitionDto
            {
                Id = created.Id,
                Name = created.Name,
                PrimaryMuscleGroup = created.PrimaryMuscleGroup,
                Description = created.Description,
                CategoryId = created.CategoryId,
                CategoryName = created.Category?.Name
            };

            return CreatedAtAction(nameof(GetDefinition), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exercise definition");
            return StatusCode(500, "An error occurred while creating the exercise definition");
        }
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ExerciseDefinitionDto>> UpdateDefinition(int id, UpdateExerciseDefinitionDto dto)
    {
        try
        {
            var definition = new ExerciseDefinition
            {
                Id = id,
                Name = dto.Name,
                PrimaryMuscleGroup = dto.PrimaryMuscleGroup,
                Description = dto.Description,
                CategoryId = dto.CategoryId
            };

            var updated = await _workoutRepository.UpdateDefinitionAsync(definition);

            var result = new ExerciseDefinitionDto
            {
                Id = updated.Id,
                Name = updated.Name,
                PrimaryMuscleGroup = updated.PrimaryMuscleGroup,
                Description = updated.Description,
                CategoryId = updated.CategoryId,
                CategoryName = updated.Category?.Name
            };

            return Ok(result);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating exercise definition");
            return StatusCode(500, "An error occurred while updating the exercise definition");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDefinition(int id)
    {
        try
        {
            await _workoutRepository.DeleteDefinitionAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exercise definition");
            return StatusCode(500, "An error occurred while deleting the exercise definition");
        }
    }
}

public record ExerciseDefinitionDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string PrimaryMuscleGroup { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? CategoryId { get; init; }
    public string? CategoryName { get; init; }
}

public record CreateExerciseDefinitionDto
{
    public string Name { get; init; } = string.Empty;
    public string PrimaryMuscleGroup { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? CategoryId { get; init; }
}

public record UpdateExerciseDefinitionDto
{
    public string Name { get; init; } = string.Empty;
    public string PrimaryMuscleGroup { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? CategoryId { get; init; }
}
