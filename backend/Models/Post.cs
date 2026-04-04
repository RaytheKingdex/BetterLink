namespace BetterLink.Backend.Models;

public class Post
{
    public long Id { get; set; }

    public long UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PostLike> Likes { get; set; } = [];
    public ICollection<PostMedia> Media { get; set; } = [];
    public ICollection<PostComment> Comments { get; set; } = [];
}
