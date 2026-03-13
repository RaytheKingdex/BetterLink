namespace BetterLink.Backend.Models;

public class Job
{
    public long Id { get; set; }
    public long EmployerId { get; set; }
    public EmployerProfile Employer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string EmploymentType { get; set; } = "full-time";
    public string Status { get; set; } = "open";
    public DateTime? ApplicationDeadline { get; set; }
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobApplication> Applications { get; set; } = [];
}
