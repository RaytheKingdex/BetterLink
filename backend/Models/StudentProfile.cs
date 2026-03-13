namespace BetterLink.Backend.Models;

public class StudentProfile
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string University { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public int? GraduationYear { get; set; }
    public decimal? Gpa { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
