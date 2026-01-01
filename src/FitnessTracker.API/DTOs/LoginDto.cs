namespace FitnessTracker.API.DTOs;

public record LoginDto
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
