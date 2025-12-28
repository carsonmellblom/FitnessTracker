using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class ExerciseDefinitionCategoriesController : ControllerBase
{
    private readonly IWorkoutRepository _workoutRepository;
    private readonly ILogger<ExerciseDefinitionCategoriesController> _logger;

    public ExerciseDefinitionCategoriesController(IWorkoutRepository workoutRepository, ILogger<ExerciseDefinitionCategoriesController> logger)
    {
        _workoutRepository = workoutRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExerciseDefinitionCategoryDto>>> GetCategories()
    {
        var categories = await _workoutRepository.GetCategoriesAsync();
        return Ok(categories.Select(c => new ExerciseDefinitionCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExerciseDefinitionCategoryDto>> GetCategory(int id)
    {
        var category = await _workoutRepository.GetCategoryByIdAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        return Ok(new ExerciseDefinitionCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        });
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDefinitionCategoryDto>> CreateCategory(CreateExerciseDefinitionCategoryDto dto)
    {
        try
        {
            var category = new ExerciseDefinitionCategory
            {
                Name = dto.Name,
                Description = dto.Description
            };

            var created = await _workoutRepository.CreateCategoryAsync(category);

            var result = new ExerciseDefinitionCategoryDto
            {
                Id = created.Id,
                Name = created.Name,
                Description = created.Description
            };

            return CreatedAtAction(nameof(GetCategory), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exercise category");
            return StatusCode(500, "An error occurred while creating the exercise category");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExerciseDefinitionCategoryDto>> UpdateCategory(int id, UpdateExerciseDefinitionCategoryDto dto)
    {
        try
        {
            var category = new ExerciseDefinitionCategory
            {
                Id = id,
                Name = dto.Name,
                Description = dto.Description
            };

            var updated = await _workoutRepository.UpdateCategoryAsync(category);

            var result = new ExerciseDefinitionCategoryDto
            {
                Id = updated.Id,
                Name = updated.Name,
                Description = updated.Description
            };

            return Ok(result);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating exercise category");
            return StatusCode(500, "An error occurred while updating the exercise category");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            await _workoutRepository.DeleteCategoryAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exercise category");
            return StatusCode(500, "An error occurred while deleting the exercise category");
        }
    }
}

public record ExerciseDefinitionCategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record CreateExerciseDefinitionCategoryDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record UpdateExerciseDefinitionCategoryDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
