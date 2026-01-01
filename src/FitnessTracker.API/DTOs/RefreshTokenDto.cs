namespace FitnessTracker.API.DTOs;

public record RefreshTokenDto
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
}
