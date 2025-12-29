using System.Security.Claims;
using FitnessTracker.API.DTOs;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(
        IAuthService authService,
        IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto.Email, dto.UserName, dto.Password, dto.ConfirmPassword);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        var response = new AuthResponseDto
        {
            UserId = result.UserId!,
            Email = result.Email!,
            UserName = result.UserName!,
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            ExpiresAt = result.ExpiresAt!.Value
        };

        SetAuthCookies(result.AccessToken!, result.RefreshToken!);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto.Email, dto.Password);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.ErrorMessage });
        }

        var response = new AuthResponseDto
        {
            UserId = result.UserId!,
            Email = result.Email!,
            UserName = result.UserName!,
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            ExpiresAt = result.ExpiresAt!.Value
        };

        SetAuthCookies(result.AccessToken!, result.RefreshToken!);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto.AccessToken, dto.RefreshToken);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        var response = new AuthResponseDto
        {
            UserId = result.UserId!,
            Email = result.Email!,
            UserName = result.UserName!,
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            ExpiresAt = result.ExpiresAt!.Value
        };

        SetAuthCookies(result.AccessToken!, result.RefreshToken!);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        // In a real app, you might want to get fresh user data from the service
        return Ok(new
        {
            userId = userId,
            email = User.FindFirstValue(ClaimTypes.Email),
            userName = User.FindFirstValue(ClaimTypes.Name)
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
        {
            await _authService.RevokeTokenAsync(userId);
        }

        // Clear cookies
        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok(new { message = "Logged out successfully" });
    }

    private void SetAuthCookies(string accessToken, string refreshToken)
    {
        // Read cookie settings from configuration
        var secureCookies = _configuration.GetValue<bool>("CookieSettings:SecureCookies");
        var sameSiteModeString = _configuration.GetValue<string>("CookieSettings:SameSiteMode") ?? "Lax";
        var sameSiteMode = Enum.Parse<SameSiteMode>(sameSiteModeString);

        // Access token cookie (shorter expiry)
        var accessTokenExpiry = TimeSpan.FromMinutes(15); // Default JWT expiry
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = secureCookies,
            SameSite = sameSiteMode,
            Expires = DateTime.UtcNow.Add(accessTokenExpiry)
        };

        Response.Cookies.Append("accessToken", accessToken, cookieOptions);

        // Refresh token cookie (longer expiry)
        var refreshTokenExpiry = TimeSpan.FromDays(7); // Default refresh token expiry
        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = secureCookies,
            SameSite = sameSiteMode,
            Expires = DateTime.UtcNow.Add(refreshTokenExpiry)
        };

        Response.Cookies.Append("refreshToken", refreshToken, refreshCookieOptions);
    }
}
