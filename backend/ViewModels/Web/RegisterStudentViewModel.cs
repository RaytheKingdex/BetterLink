using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.ViewModels.Web;

public class RegisterStudentViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(140)]
    public string University { get; set; } = string.Empty;

    [Required, MaxLength(140)]
    public string ProgramName { get; set; } = string.Empty;

    public int? GraduationYear { get; set; }
    public decimal? Gpa { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? PortfolioUrl { get; set; }
}
