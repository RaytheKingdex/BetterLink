using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.Models.DTOs.Messages;

public class SendMessageRequest
{
    [Required]
    [MaxLength(2000)]
    public string Body { get; set; } = string.Empty;
}
