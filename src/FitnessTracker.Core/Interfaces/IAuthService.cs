namespace FitnessTracker.Core.Interfaces;

/// <summary>
/// Service for handling authentication operations including registration, login, and token management.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user and returns authentication result with tokens.
    /// </summary>
    Task<AuthServiceResult> RegisterAsync(string email, string userName, string password, string confirmPassword);

    /// <summary>
    /// Authenticates a user and returns authentication result with tokens.
    /// </summary>
    Task<AuthServiceResult> LoginAsync(string email, string password);

    /// <summary>
    /// Refreshes an expired access token using a valid refresh token.
    /// </summary>
    Task<AuthServiceResult> RefreshTokenAsync(string accessToken, string refreshToken);

    /// <summary>
    /// Revokes the user's refresh token (used for logout).
    /// </summary>
    Task RevokeTokenAsync(string userId);
}

/// <summary>
/// Result of an authentication operation.
/// </summary>
public class AuthServiceResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
