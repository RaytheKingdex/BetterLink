namespace BetterLink.Backend.Models.DTOs.Jobs;

public class MyJobListItem
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime PostedDate { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
    public int ApplicantCount { get; set; }
}
