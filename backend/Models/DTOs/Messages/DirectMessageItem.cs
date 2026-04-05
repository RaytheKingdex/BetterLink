namespace BetterLink.Backend.Models.DTOs.Messages;

public class DirectMessageItem
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
