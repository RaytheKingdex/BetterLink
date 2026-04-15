namespace BetterLink.Backend.Models.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public long UserId { get; set; }
    public string? DisplayId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
