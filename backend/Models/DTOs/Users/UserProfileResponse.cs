namespace BetterLink.Backend.Models.DTOs.Users;

public class UserProfileResponse
{
    public long UserId { get; set; }
    public string? DisplayId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public IEnumerable<string> Roles { get; set; } = [];
    public StudentProfileDto? StudentProfile { get; set; }
    public EmployerProfileDto? EmployerProfile { get; set; }
}

public class StudentProfileDto
{
    public string University { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public int? GraduationYear { get; set; }
    public decimal? Gpa { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? PortfolioUrl { get; set; }
}

public class EmployerProfileDto
{
    public string OrganizationName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
}
