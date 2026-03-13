using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Communities;

public class CreateCommunityMessageRequest
{
    [Required]
    public string Body { get; set; } = string.Empty;
}
