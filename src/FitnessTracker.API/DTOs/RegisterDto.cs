namespace FitnessTracker.API.DTOs;

public record RegisterDto
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
    public required string UserName { get; init; }
}
