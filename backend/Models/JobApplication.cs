namespace BetterLink.Backend.Models;

public class JobApplication
{
    public long Id { get; set; }
    public long JobId { get; set; }
    public Job Job { get; set; } = null!;

    public long StudentUserId { get; set; }
    public ApplicationUser StudentUser { get; set; } = null!;

    public string? CoverLetter { get; set; }
    public string Status { get; set; } = "submitted";
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
