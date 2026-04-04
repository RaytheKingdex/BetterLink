namespace BetterLink.Backend.Models.DTOs.Jobs;

public class UpdateJobRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string EmploymentType { get; set; } = "full-time";
    public string Status { get; set; } = "open";
    public DateTime? ApplicationDeadline { get; set; }
}
