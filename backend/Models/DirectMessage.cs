namespace BetterLink.Backend.Models;

public class DirectMessage
{
    public long Id { get; set; }

    public long SenderId { get; set; }
    public ApplicationUser Sender { get; set; } = null!;

    public long RecipientId { get; set; }
    public ApplicationUser Recipient { get; set; } = null!;

    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }
}
