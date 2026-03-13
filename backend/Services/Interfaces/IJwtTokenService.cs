using BetterLink.Backend.Models;

namespace BetterLink.Backend.Services.Interfaces;

public interface IJwtTokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);
}
