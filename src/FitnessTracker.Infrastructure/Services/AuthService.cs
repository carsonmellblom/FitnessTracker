using System.Security.Claims;
using FitnessTracker.Core.Config;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace FitnessTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;

    // Error message constants
    private const string PasswordMismatchError = "Passwords do not match";
    private const string EmailInUseError = "Email already in use";
    private const string InvalidCredentialsError = "Invalid email or password";
    private const string InvalidAccessTokenError = "Invalid access token";
    private const string InvalidTokenClaimsError = "Invalid token claims";
    private const string InvalidRefreshTokenError = "Invalid refresh token";
    private const string UserCreationFailedError = "Failed to create user";

    public AuthService(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _jwtSettings = jwtSettings?.Value ?? throw new ArgumentNullException(nameof(jwtSettings));
    }

    public async Task<AuthServiceResult> RegisterAsync(string email, string userName, string password, string confirmPassword)
    {
        if (password != confirmPassword)
        {
            return CreateErrorResult(PasswordMismatchError);
        }

        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return CreateErrorResult(EmailInUseError);
        }

        var user = new ApplicationUser
        {
            Email = email,
            UserName = userName,
            EmailConfirmed = true // Auto-confirm for now
        };

        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return CreateErrorResult($"{UserCreationFailedError}: {errors}");
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthServiceResult> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return CreateErrorResult(InvalidCredentialsError);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);

        if (!isPasswordValid)
        {
            return CreateErrorResult(InvalidCredentialsError);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthServiceResult> RefreshTokenAsync(string accessToken, string refreshToken)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return CreateErrorResult(InvalidAccessTokenError);
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return CreateErrorResult(InvalidTokenClaimsError);
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return CreateErrorResult(InvalidRefreshTokenError);
        }

        // Validate refresh token
        if (!IsRefreshTokenValid(user, refreshToken))
        {
            return CreateErrorResult(InvalidRefreshTokenError);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task RevokeTokenAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
        }
    }

    /// <summary>
    /// Validates if the provided refresh token matches the user's stored token and is not expired.
    /// </summary>
    private bool IsRefreshTokenValid(ApplicationUser user, string refreshToken)
    {
        if (user.RefreshToken != refreshToken)
        {
            return false;
        }

        if (user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return false;
        }

        return true;
    }

    /// <summary>
    /// Creates an error result with the specified message.
    /// </summary>
    private static AuthServiceResult CreateErrorResult(string errorMessage)
    {
        return new AuthServiceResult
        {
            Success = false,
            ErrorMessage = errorMessage
        };
    }

    /// <summary>
    /// Generates new tokens and updates the user's refresh token in the database.
    /// </summary>
    private async Task<AuthServiceResult> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        await _userManager.UpdateAsync(user);

        return new AuthServiceResult
        {
            Success = true,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes)
        };
    }
}
