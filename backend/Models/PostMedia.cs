namespace BetterLink.Backend.Models;

public class PostMedia
{
    public long Id { get; set; }

    public long PostId { get; set; }
    public Post Post { get; set; } = null!;

    /// <summary>"image" or "video"</summary>
    public string MediaType { get; set; } = "image";

    public string FileName { get; set; } = string.Empty;

    /// <summary>Relative URL served by the static files middleware, e.g. /uploads/posts/1/abc.jpg</summary>
    public string RelativeUrl { get; set; } = string.Empty;

    public string MimeType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
