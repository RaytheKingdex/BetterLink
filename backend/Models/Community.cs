namespace BetterLink.Backend.Models;

public class Community
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public long CreatedByUserId { get; set; }
    public ApplicationUser CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CommunityMember> Members { get; set; } = [];
    public ICollection<CommunityMessage> Messages { get; set; } = [];
}
