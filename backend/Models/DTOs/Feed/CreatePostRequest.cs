using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Feed;

public class CreatePostRequest
{
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
}
