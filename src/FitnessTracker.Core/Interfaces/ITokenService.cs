using System.Security.Claims;
using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
