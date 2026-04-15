using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Mvc;

namespace BetterLink.Backend.Controllers.Web;

[Route("")]
public class PagesController : Controller
{
    [HttpGet("about")]
    public IActionResult About()
    {
        return View();
    }

    [HttpGet("services")]
    public IActionResult Services()
    {
        return View();
    }

    [HttpGet("contact")]
    public IActionResult Contact()
    {
        return View(new ContactViewModel());
    }

    [HttpPost("contact")]
    [ValidateAntiForgeryToken]
    public IActionResult Contact(ContactViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        TempData["ContactSent"] = "Thanks for reaching out. Your message has been received.";
        return RedirectToAction(nameof(Contact));
    }

    [HttpGet("forgot-password")]
    public IActionResult ForgotPassword()
    {
        return View(new ForgotPasswordViewModel());
    }

    [HttpPost("forgot-password")]
    [ValidateAntiForgeryToken]
    public IActionResult ForgotPassword(ForgotPasswordViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        TempData["PasswordResetRequested"] = "If the email exists, password reset instructions have been sent.";
        return RedirectToAction(nameof(ForgotPassword));
    }
}
