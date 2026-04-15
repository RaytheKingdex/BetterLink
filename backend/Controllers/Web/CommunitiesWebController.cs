using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.ViewModels.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers.Web;

[Route("communities")]
public class CommunitiesWebController : Controller
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public CommunitiesWebController(AppDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet("")]
    [HttpGet("index")]
    public async Task<IActionResult> Index()
    {
        var communities = await _dbContext.Communities
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Take(50)
            .ToListAsync();

        var joinedCommunityIds = new HashSet<long>();
        if (User.Identity?.IsAuthenticated == true)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is not null)
            {
                var joinedIds = await _dbContext.CommunityMembers
                    .AsNoTracking()
                    .Where(cm => cm.UserId == user.Id)
                    .Select(cm => cm.CommunityId)
                    .ToListAsync();

                joinedCommunityIds = new HashSet<long>(joinedIds);
            }
        }

        ViewData["CreateModel"] = new CreateCommunityViewModel();
        ViewData["JoinedCommunityIds"] = joinedCommunityIds;
        return View(communities);
    }

    [Authorize]
    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateCommunityViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var communities = await _dbContext.Communities
                .AsNoTracking()
                .OrderByDescending(c => c.CreatedAt)
                .Take(50)
                .ToListAsync();
            ViewData["CreateModel"] = model;
            return View("Index", communities);
        }

        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        var community = new Community
        {
            Name = model.Name,
            Description = model.Description,
            CreatedByUserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Communities.Add(community);
        await _dbContext.SaveChangesAsync();

        _dbContext.CommunityMembers.Add(new CommunityMember
        {
            CommunityId = community.Id,
            UserId = user.Id,
            Role = "owner",
            JoinedAt = DateTime.UtcNow
        });
        await _dbContext.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [Authorize]
    [HttpPost("{id:long}/join")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Join(long id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        var communityExists = await _dbContext.Communities.AnyAsync(c => c.Id == id);
        if (!communityExists)
        {
            return NotFound();
        }

        var existing = await _dbContext.CommunityMembers
            .AnyAsync(cm => cm.CommunityId == id && cm.UserId == user.Id);

        if (!existing)
        {
            _dbContext.CommunityMembers.Add(new CommunityMember
            {
                CommunityId = id,
                UserId = user.Id,
                Role = "member",
                JoinedAt = DateTime.UtcNow
            });
            await _dbContext.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Index));
    }

    [Authorize]
    [HttpPost("{id:long}/unjoin")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Unjoin(long id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Challenge();
        }

        var membership = await _dbContext.CommunityMembers
            .FirstOrDefaultAsync(cm => cm.CommunityId == id && cm.UserId == user.Id);

        if (membership is not null)
        {
            _dbContext.CommunityMembers.Remove(membership);
            await _dbContext.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Index));
    }
}
