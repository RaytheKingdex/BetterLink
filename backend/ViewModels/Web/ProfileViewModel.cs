using BetterLink.Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.ViewModels.Web;

public class ProfileViewModel
{
    public long UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? DisplayId { get; set; }

    [MaxLength(120)]
    public string? FirstName { get; set; }

    [MaxLength(120)]
    public string? LastName { get; set; }

    [MaxLength(2000)]
    public string? Bio { get; set; }

    public StudentProfile? StudentProfile { get; set; }
    public EmployerProfile? EmployerProfile { get; set; }
}
