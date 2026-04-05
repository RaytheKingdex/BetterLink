namespace BetterLink.Backend.Models.DTOs.Feed;

public class FeedPostItem
{
    public long Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public long AuthorId { get; set; }
    public string AuthorFirstName { get; set; } = string.Empty;
    public string AuthorLastName { get; set; } = string.Empty;
    public int LikeCount { get; set; }
    public bool LikedByMe { get; set; }
    public int CommentCount { get; set; }
    public List<PostMediaItem> Media { get; set; } = [];
}
