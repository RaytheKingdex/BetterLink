namespace BetterLink.Backend.Models;

public class PostComment
{
    public long Id { get; set; }

    public long PostId { get; set; }
    public Post Post { get; set; } = null!;

    public long UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
