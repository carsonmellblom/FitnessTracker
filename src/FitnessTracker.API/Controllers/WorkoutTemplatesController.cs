using System.Security.Claims;
using FitnessTracker.API.Filters;
using Asp.Versioning;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[Authorize]
public class WorkoutTemplatesController : ControllerBase
{
    private readonly IWorkoutTemplateRepository _templateRepository;

    public WorkoutTemplatesController(
        IWorkoutTemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutTemplateDto>>> GetTemplates()
    {
        var userId = GetUserId();
        var templates = await _templateRepository.GetAllAsync(userId);
        return Ok(templates.Select(MapToDto));
    }

    [HttpGet("{id}")]
    [ValidateResourceOwnership]
    public async Task<ActionResult<WorkoutTemplateDto>> GetTemplate(int id)
    {
        var template = await _templateRepository.GetByIdAsync(id);
        if (template == null) return NotFound();
        return Ok(MapToDto(template));
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutTemplateDto>> CreateTemplate(CreateWorkoutTemplateRequest request)
    {
        var userId = GetUserId();
        var template = new WorkoutTemplate
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Exercises = request.Exercises.Select((e, idx) => new TemplateExercise
            {
                ExerciseDefinitionId = e.ExerciseDefinitionId,
                SortOrder = idx,
                Notes = e.Notes,
                TargetSets = e.TargetSets.Select(s => new TemplateSet
                {
                    SetNumber = s.SetNumber,
                    TargetReps = s.TargetReps,
                    TargetWeight = s.TargetWeight
                }).ToList()
            }).ToList()
        };

        var created = await _templateRepository.CreateAsync(template);
        return CreatedAtAction(nameof(GetTemplate), new { id = created.Id }, MapToDto(created));
    }

    [HttpPatch("{id}")]
    [ValidateResourceOwnership]
    public async Task<ActionResult<WorkoutTemplateDto>> UpdateTemplate(int id, CreateWorkoutTemplateRequest request)
    {
        var existing = await _templateRepository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        var template = new WorkoutTemplate
        {
            Id = id,
            UserId = existing.UserId,
            Title = request.Title,
            Description = request.Description,
            Exercises = request.Exercises.Select((e, idx) => new TemplateExercise
            {
                ExerciseDefinitionId = e.ExerciseDefinitionId,
                SortOrder = idx,
                Notes = e.Notes,
                TargetSets = e.TargetSets.Select(s => new TemplateSet
                {
                    SetNumber = s.SetNumber,
                    TargetReps = s.TargetReps,
                    TargetWeight = s.TargetWeight
                }).ToList()
            }).ToList()
        };

        var updated = await _templateRepository.UpdateAsync(template);
        return Ok(MapToDto(updated));
    }

    [HttpDelete("{id}")]
    [ValidateResourceOwnership]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        await _templateRepository.DeleteAsync(id);
        return NoContent();
    }

    private static WorkoutTemplateDto MapToDto(WorkoutTemplate template) => new()
    {
        Id = template.Id,
        Title = template.Title,
        Description = template.Description,
        CreatedAt = template.CreatedAt,
        Exercises = template.Exercises.Select(e => new TemplateExerciseDto
        {
            Id = e.Id,
            ExerciseDefinitionId = e.ExerciseDefinitionId,
            ExerciseName = e.ExerciseDefinition?.Name ?? "Unknown",
            Notes = e.Notes,
            TargetSets = e.TargetSets.Select(s => new TemplateSetDto
            {
                Id = s.Id,
                SetNumber = s.SetNumber,
                TargetReps = s.TargetReps,
                TargetWeight = s.TargetWeight
            }).OrderBy(s => s.SetNumber).ToList()
        }).OrderBy(e => e.Id).ToList()
    };
}

public record WorkoutTemplateDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<TemplateExerciseDto> Exercises { get; init; } = new();
}

public record TemplateExerciseDto
{
    public int Id { get; init; }
    public int ExerciseDefinitionId { get; init; }
    public string ExerciseName { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public List<TemplateSetDto> TargetSets { get; init; } = new();
}

public record TemplateSetDto
{
    public int Id { get; init; }
    public int SetNumber { get; init; }
    public int? TargetReps { get; init; }
    public decimal? TargetWeight { get; init; }
}

public record CreateWorkoutTemplateRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public List<CreateTemplateExerciseRequest> Exercises { get; init; } = new();
}

public record CreateTemplateExerciseRequest
{
    public int ExerciseDefinitionId { get; init; }
    public string? Notes { get; init; }
    public List<CreateTemplateSetRequest> TargetSets { get; init; } = new();
}

public record CreateTemplateSetRequest
{
    public int SetNumber { get; init; }
    public int? TargetReps { get; init; }
    public decimal? TargetWeight { get; init; }
}
