using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Auth;

public class RegisterEmployerRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(180)]
    public string OrganizationName { get; set; } = string.Empty;

    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }
}
