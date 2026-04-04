namespace BetterLink.Backend.Models.DTOs.Jobs;

public class JobApplicantItem
{
    public long ApplicationId { get; set; }
    public long StudentUserId { get; set; }
    public string? DisplayId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public int? GraduationYear { get; set; }
    public decimal? Gpa { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? CoverLetter { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}
