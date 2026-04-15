using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.ViewModels.Web;

public class CreateJobViewModel
{
    [Required, MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [MaxLength(140)]
    public string? Location { get; set; }

    [Required, MaxLength(40)]
    public string EmploymentType { get; set; } = "full-time";

    [DataType(DataType.Date)]
    public DateTime? ApplicationDeadline { get; set; }
}
