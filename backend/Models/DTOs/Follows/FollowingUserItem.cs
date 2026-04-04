namespace BetterLink.Backend.Models.DTOs.Follows;

public class FollowingUserItem
{
    public long UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? LastMessagePreview { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public bool HasUnread { get; set; }
}
