namespace BetterLink.Backend.Models;

public class CommunityMessage
{
    public long Id { get; set; }
    public long CommunityId { get; set; }
    public Community Community { get; set; } = null!;

    public long SenderUserId { get; set; }
    public ApplicationUser Sender { get; set; } = null!;

    public string Body { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentType { get; set; }   // "image" | "video" | "document"
    public string? AttachmentMimeType { get; set; }
    public string? AttachmentName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
