namespace FitnessTracker.API.DTOs;

public record AuthResponseDto
{
    public required string UserId { get; init; }
    public required string Email { get; init; }
    public required string UserName { get; init; }
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTime ExpiresAt { get; init; }
}
