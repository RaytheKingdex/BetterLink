namespace BetterLink.Backend.Models;

public class UserFollow
{
    public long Id { get; set; }

    public long FollowerId { get; set; }
    public ApplicationUser Follower { get; set; } = null!;

    public long FollowingId { get; set; }
    public ApplicationUser Following { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
