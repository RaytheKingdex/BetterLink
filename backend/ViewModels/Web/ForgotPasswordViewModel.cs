using System.ComponentModel.DataAnnotations;

namespace BetterLink.Backend.ViewModels.Web;

public class ForgotPasswordViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}
