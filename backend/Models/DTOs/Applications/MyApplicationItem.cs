namespace BetterLink.Backend.Models.DTOs.Applications;

public class MyApplicationItem
{
    public long ApplicationId { get; set; }
    public long JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string EmployerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}
