using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers.Web;

[Route("jobs")]
public class JobsWebController : Controller
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public JobsWebController(AppDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet("")]
    [HttpGet("index")]
    public async Task<IActionResult> Index(string? q = null)
    {
        var query = _dbContext.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(j =>
                j.Title.Contains(term) ||
                j.Description.Contains(term) ||
                (j.Location != null && j.Location.Contains(term)) ||
                j.EmploymentType.Contains(term));
        }

        var jobs = await query
            .OrderByDescending(j => j.PostedDate)
            .ToListAsync();

        ViewData["SearchQuery"] = q ?? string.Empty;

        return View(jobs);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Details(long id)
    {
        var job = await _dbContext.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job is null)
        {
            return NotFound();
        }

        var user = await _userManager.GetUserAsync(User);
        var alreadyApplied = false;

        if (user is not null)
        {
            alreadyApplied = await _dbContext.JobApplications
                .AsNoTracking()
                .AnyAsync(a => a.JobId == id && a.StudentUserId == user.Id);
        }

        ViewData["AlreadyApplied"] = alreadyApplied;
        return View(job);
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("create")]
    public IActionResult Create()
    {
        return View(new CreateJobViewModel());
    }

    [Authorize(Roles = "Employer")]
    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateJobViewModel model)
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

        var employerProfile = await _dbContext.EmployerProfiles
            .FirstOrDefaultAsync(e => e.UserId == user.Id);

        if (employerProfile is null)
        {
            ModelState.AddModelError(string.Empty, "Employer profile not found.");
            return View(model);
        }

        var job = new Job
        {
            EmployerId = employerProfile.Id,
            Title = model.Title,
            Description = model.Description,
            Location = model.Location,
            EmploymentType = model.EmploymentType,
            ApplicationDeadline = model.ApplicationDeadline,
            Status = "open",
            PostedDate = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [Authorize(Roles = "Student")]
    [HttpPost("{id:long}/apply")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Apply(long id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        var jobExists = await _dbContext.Jobs.AnyAsync(j => j.Id == id);
        if (!jobExists)
        {
            return NotFound();
        }

        var alreadyApplied = await _dbContext.JobApplications
            .AnyAsync(a => a.JobId == id && a.StudentUserId == user.Id);

        if (!alreadyApplied)
        {
            _dbContext.JobApplications.Add(new JobApplication
            {
                JobId = id,
                StudentUserId = user.Id,
                Status = "submitted",
                AppliedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await _dbContext.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Details), new { id });
    }
}
