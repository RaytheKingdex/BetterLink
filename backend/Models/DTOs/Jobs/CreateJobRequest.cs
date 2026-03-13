using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Jobs;

public class CreateJobRequest
{
    [Required, MaxLength(180)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? Location { get; set; }

    [Required]
    [RegularExpression("internship|part-time|full-time|contract")]
    public string EmploymentType { get; set; } = "full-time";

    public DateTime? ApplicationDeadline { get; set; }
}
