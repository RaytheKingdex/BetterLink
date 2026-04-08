using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers.Web;

[Route("account")]
public class AccountController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _dbContext;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext dbContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
    }

    [AllowAnonymous]
    [HttpGet("login")]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View(new LoginViewModel());
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null)
        {
            ModelState.AddModelError(string.Empty, "Invalid email or password.");
            return View(model);
        }

        var signInResult = await _signInManager.PasswordSignInAsync(user, model.Password, true, false);
        if (!signInResult.Succeeded)
        {
            ModelState.AddModelError(string.Empty, "Invalid email or password.");
            return View(model);
        }

        if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
        {
            return Redirect(returnUrl);
        }

        return RedirectToAction("Index", "Home");
    }

    [AllowAnonymous]
    [HttpGet("register/student")]
    public IActionResult RegisterStudent()
    {
        return View(new RegisterStudentViewModel());
    }

    [AllowAnonymous]
    [HttpPost("register/student")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegisterStudent(RegisterStudentViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        if (await _userManager.Users.AnyAsync(u => u.Email == model.Email))
        {
            ModelState.AddModelError(nameof(model.Email), "A user with this email already exists.");
            return View(model);
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault(),
            LastName = model.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault(),
            DisplayId = await GenerateDisplayIdAsync(),
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
        {
            foreach (var error in createResult.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }

            return View(model);
        }

        await _userManager.AddToRoleAsync(user, "Student");

        _dbContext.StudentProfiles.Add(new StudentProfile
        {
            UserId = user.Id,
            University = model.University,
            ProgramName = model.ProgramName,
            GraduationYear = model.GraduationYear,
            Gpa = model.Gpa,
            Skills = model.Skills,
            ResumeUrl = model.ResumeUrl,
            PortfolioUrl = model.PortfolioUrl
        });

        await _dbContext.SaveChangesAsync();
        await _signInManager.SignInAsync(user, true);

        return RedirectToAction("Index", "Home");
    }

    [AllowAnonymous]
    [HttpGet("register/employer")]
    public IActionResult RegisterEmployer()
    {
        return View(new RegisterEmployerViewModel());
    }

    [AllowAnonymous]
    [HttpPost("register/employer")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegisterEmployer(RegisterEmployerViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        if (await _userManager.Users.AnyAsync(u => u.Email == model.Email))
        {
            ModelState.AddModelError(nameof(model.Email), "A user with this email already exists.");
            return View(model);
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault(),
            LastName = model.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault(),
            DisplayId = await GenerateDisplayIdAsync(),
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
        {
            foreach (var error in createResult.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }

            return View(model);
        }

        await _userManager.AddToRoleAsync(user, "Employer");

        _dbContext.EmployerProfiles.Add(new EmployerProfile
        {
            UserId = user.Id,
            OrganizationName = model.OrganizationName,
            Industry = model.Industry,
            Website = model.Website,
            Location = model.Location,
            IsVerified = false
        });

        await _dbContext.SaveChangesAsync();
        await _signInManager.SignInAsync(user, true);

        return RedirectToAction("Index", "Home");
    }

    [Authorize]
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Index", "Home");
    }

    private async Task<string> GenerateDisplayIdAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = year.ToString();

        var existingIds = await _dbContext.Users
            .Where(u => u.DisplayId != null && u.DisplayId.StartsWith(prefix))
            .Select(u => u.DisplayId!)
            .ToListAsync();

        var nextSeq = 1;
        if (existingIds.Count > 0)
        {
            var max = existingIds
                .Select(id => int.TryParse(id[4..], out var n) ? n : 0)
                .DefaultIfEmpty(0)
                .Max();
            nextSeq = max + 1;
        }

        return $"{year}{nextSeq:D4}";
    }
}
