namespace BetterLink.Backend.Models.DTOs.Feed;

public class PostCommentItem
{
    public long Id { get; set; }
    public long PostId { get; set; }
    public long AuthorId { get; set; }
    public string AuthorFirstName { get; set; } = string.Empty;
    public string AuthorLastName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
