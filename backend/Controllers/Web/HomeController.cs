using BetterLink.Backend.Data;
using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers.Web;

public class HomeController : Controller
{
    private readonly AppDbContext _dbContext;

    public HomeController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var jobs = await _dbContext.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .OrderByDescending(j => j.PostedDate)
            .Take(6)
            .ToListAsync();

        var communities = await _dbContext.Communities
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Take(6)
            .ToListAsync();

        var model = new HomeIndexViewModel
        {
            FeaturedJobs = jobs,
            FeaturedCommunities = communities
        };

        return View(model);
    }
}
