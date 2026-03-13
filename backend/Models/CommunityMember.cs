namespace BetterLink.Backend.Models;

public class CommunityMember
{
    public long Id { get; set; }
    public long CommunityId { get; set; }
    public Community Community { get; set; } = null!;

    public long UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Role { get; set; } = "member";
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
