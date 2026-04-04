namespace BetterLink.Backend.Models.DTOs.Communities;

public class CommunityMessageItem
{
    public long Id { get; set; }
    public long SenderUserId { get; set; }
    public string SenderFirstName { get; set; } = string.Empty;
    public string SenderLastName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentType { get; set; }
    public string? AttachmentMimeType { get; set; }
    public string? AttachmentName { get; set; }
    public DateTime CreatedAt { get; set; }
}
