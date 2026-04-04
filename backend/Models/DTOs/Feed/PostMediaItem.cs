namespace BetterLink.Backend.Models.DTOs.Feed;

public class PostMediaItem
{
    public long Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
}
