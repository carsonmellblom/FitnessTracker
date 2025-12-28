using System.Security.Claims;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FitnessTracker.API.Filters;

/// <summary>
/// Attribute to validate resource ownership.
/// Apply to controller methods that access resources by ID.
/// Automatically allows admin users to bypass ownership checks.
/// </summary>
public class ValidateResourceOwnershipAttribute : TypeFilterAttribute
{
    public ValidateResourceOwnershipAttribute() : base(typeof(ValidateResourceOwnershipFilter))
    {
    }
}

/// <summary>
/// Action filter that validates user owns the requested resource.
/// Supports admin bypass via "Admin" role.
/// </summary>
public class ValidateResourceOwnershipFilter : IAsyncActionFilter
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutTemplateRepository _templateRepo;
    private readonly IPhotoRepository _photoRepo;

    public ValidateResourceOwnershipFilter(
        IWorkoutRepository workoutRepo,
        IWorkoutTemplateRepository templateRepo,
        IPhotoRepository photoRepo)
    {
        _workoutRepo = workoutRepo;
        _templateRepo = templateRepo;
        _photoRepo = photoRepo;
    }

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Admin bypass - admins can access all resources
        if (context.HttpContext.User.IsInRole("Admin"))
        {
            await next();
            return;
        }

        // Check if action has an 'id' parameter
        if (context.ActionArguments.TryGetValue("id", out var idObj) && idObj is int id)
        {
            var controllerName = context.RouteData.Values["controller"]?.ToString();

            bool isOwner = controllerName switch
            {
                "Workouts" => await CheckWorkoutOwnership(id, userId!),
                "WorkoutTemplates" => await CheckTemplateOwnership(id, userId!),
                "Photos" => await CheckPhotoOwnership(id, userId!),
                _ => false
            };

            if (!isOwner)
            {
                // Return 403 Forbidden instead of 404 to avoid information leakage
                context.Result = new ForbidResult();
                return;
            }
        }

        await next();
    }

    private async Task<bool> CheckWorkoutOwnership(int id, string userId)
    {
        var workout = await _workoutRepo.GetByIdAsync(id);
        return workout?.UserId == userId;
    }

    private async Task<bool> CheckTemplateOwnership(int id, string userId)
    {
        var template = await _templateRepo.GetByIdAsync(id);
        return template?.UserId == userId;
    }

    private async Task<bool> CheckPhotoOwnership(int id, string userId)
    {
        var photo = await _photoRepo.GetByIdAsync(id);
        return photo?.UserId == userId;
    }
}
