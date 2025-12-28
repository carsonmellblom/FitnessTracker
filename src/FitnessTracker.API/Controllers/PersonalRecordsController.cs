using System.Security.Claims;
using FitnessTracker.Core.Entities;
using FitnessTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Asp.Versioning;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[Authorize]
public class PersonalRecordsController : ControllerBase
{
    private readonly FitnessDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public PersonalRecordsController(FitnessDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExercisePRsDto>>> GetAllPRs()
    {
        // Get all sets with valid weight/reps, grouped by exercise definition
        var allSets = await _context.ExerciseSets
            .Include(s => s.Exercise)
                .ThenInclude(e => e.ExerciseDefinition)
            .Include(s => s.Exercise)
                .ThenInclude(e => e.Workout)
            .Where(s => s.Exercise.Workout.UserId == GetUserId() &&
                       s.Weight != null && s.Reps != null && s.Reps > 0)
            .ToListAsync();

        // Group by exercise definition
        var exerciseGroups = allSets
            .GroupBy(s => new
            {
                s.Exercise.ExerciseDefinitionId,
                s.Exercise.ExerciseDefinition.Name
            })
            .Select(eg => new ExercisePRsDto
            {
                ExerciseDefinitionId = eg.Key.ExerciseDefinitionId,
                ExerciseName = eg.Key.Name,
                Records = eg
                    .GroupBy(s => s.Reps!.Value)
                    .Select(rg =>
                    {
                        var prSet = rg.OrderByDescending(s => s.Weight!.Value)
                                      .ThenBy(s => s.Id)
                                      .First();
                        return new PRRecordDto
                        {
                            Reps = rg.Key,
                            Weight = prSet.Weight!.Value,
                            AchievedDate = prSet.Exercise.Workout.WorkoutDate
                        };
                    })
                    .OrderBy(r => r.Reps)
                    .ToList()
            })
            .OrderBy(e => e.ExerciseName)
            .ToList();

        return Ok(exerciseGroups);
    }
}

public class ExercisePRsDto
{
    public int ExerciseDefinitionId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public List<PRRecordDto> Records { get; set; } = new();
}

public class PRRecordDto
{
    public int Reps { get; set; }
    public decimal Weight { get; set; }
    public DateTime AchievedDate { get; set; }
}
