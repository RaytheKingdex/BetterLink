using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.ViewModels.Web;

public class CreateCommunityViewModel
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }
}
