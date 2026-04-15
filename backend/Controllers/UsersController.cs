using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Feed;
using BetterLink.Backend.Models.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;

    public UsersController(UserManager<ApplicationUser> userManager, AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    // GET /api/users/:id — public profile of any user
    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserProfileResponse>> GetUserById(long id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new UserProfileResponse
        {
            UserId = user.Id,
            DisplayId = user.DisplayId,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Bio = user.Bio,
            Roles = roles
        });
    }

    // GET /api/users/{id}/posts?page=1&pageSize=20 — posts authored by a given user
    [HttpGet("{id:long}/posts")]
    public async Task<IActionResult> GetUserPosts(long id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        pageSize = Math.Clamp(pageSize, 1, 50);
        var skip = (page - 1) * pageSize;

        var posts = await _dbContext.Posts
            .AsNoTracking()
            .Where(p => p.UserId == id)
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(p => new FeedPostItem
            {
                Id = p.Id,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                AuthorId = p.UserId,
                AuthorFirstName = p.User.FirstName ?? string.Empty,
                AuthorLastName = p.User.LastName ?? string.Empty,
                LikeCount = p.Likes.Count,
                LikedByMe = p.Likes.Any(l => l.UserId == myId),
                Media = p.Media
                    .OrderBy(m => m.Id)
                    .Select(m => new PostMediaItem
                    {
                        Id = m.Id,
                        Url = m.RelativeUrl,
                        MediaType = m.MediaType,
                        MimeType = m.MimeType,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMe()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        StudentProfileDto? studentDto = null;
        EmployerProfileDto? employerDto = null;

        if (roles.Contains("Student"))
        {
            var sp = await _dbContext.StudentProfiles.AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == userId);
            if (sp is not null)
                studentDto = new StudentProfileDto
                {
                    University = sp.University,
                    ProgramName = sp.ProgramName,
                    GraduationYear = sp.GraduationYear,
                    Gpa = sp.Gpa,
                    Skills = sp.Skills,
                    ResumeUrl = sp.ResumeUrl,
                    PortfolioUrl = sp.PortfolioUrl
                };
        }
        else if (roles.Contains("Employer"))
        {
            var ep = await _dbContext.EmployerProfiles.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);
            if (ep is not null)
                employerDto = new EmployerProfileDto
                {
                    OrganizationName = ep.OrganizationName,
                    Industry = ep.Industry,
                    Website = ep.Website,
                    Location = ep.Location,
                    IsVerified = ep.IsVerified
                };
        }

        return Ok(new UserProfileResponse
        {
            UserId = user.Id,
            DisplayId = user.DisplayId,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Bio = user.Bio,
            Roles = roles,
            StudentProfile = studentDto,
            EmployerProfile = employerDto
        });
    }

    // DELETE /api/users/me — permanently delete own account
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return NotFound();

        // Remove records that use Restrict FK behaviour so MySQL
        // doesn't block the AspNetUsers row deletion.

        // 1. Communities created by this user — cascade removes their members & messages
        var ownedCommunities = await _dbContext.Communities
            .Where(c => c.CreatedByUserId == userId)
            .ToListAsync();
        _dbContext.Communities.RemoveRange(ownedCommunities);

        // 2. Direct messages where this user is the recipient (Restrict on RecipientId)
        var receivedDms = await _dbContext.DirectMessages
            .Where(m => m.RecipientId == userId)
            .ToListAsync();
        _dbContext.DirectMessages.RemoveRange(receivedDms);

        await _dbContext.SaveChangesAsync();

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return NoContent();
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserProfileRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName.Trim();

        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName.Trim();

        // Bio can be cleared (empty string = remove), or set to new value
        if (request.Bio is not null)
            user.Bio = request.Bio.Trim().Length == 0 ? null : request.Bio.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return NoContent();
    }
}
