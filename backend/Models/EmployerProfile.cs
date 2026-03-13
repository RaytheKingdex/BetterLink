namespace BetterLink.Backend.Models;

public class EmployerProfile
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string OrganizationName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Job> Jobs { get; set; } = [];
}
