using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers.Web;

[Authorize]
[Route("profile")]
public class ProfileController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;

    public ProfileController(UserManager<ApplicationUser> userManager, AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [HttpGet("")]
    [HttpGet("index")]
    public async Task<IActionResult> Index()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        var model = new ProfileViewModel
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Role = role,
            DisplayId = user.DisplayId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Bio = user.Bio,
            StudentProfile = await _dbContext.StudentProfiles.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == user.Id),
            EmployerProfile = await _dbContext.EmployerProfiles.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == user.Id)
        };

        return View(model);
    }

    [HttpPost("index")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(ProfileViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        user.FirstName = model.FirstName;
        user.LastName = model.LastName;
        user.Bio = model.Bio;

        await _userManager.UpdateAsync(user);
        return RedirectToAction(nameof(Index));
    }
}
