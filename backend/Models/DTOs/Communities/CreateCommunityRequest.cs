using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Communities;

public class CreateCommunityRequest
{
    [Required, MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
