using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Users;

public class UpdateUserProfileRequest
{
    [MaxLength(120)]
    public string? FirstName { get; set; }

    [MaxLength(120)]
    public string? LastName { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }
}
