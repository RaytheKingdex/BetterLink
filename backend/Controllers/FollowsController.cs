using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Follows;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public FollowsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/follows/following
    // Returns users the current user follows, sorted by most recent message activity
    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var following = await _dbContext.UserFollows
            .AsNoTracking()
            .Where(f => f.FollowerId == userId)
            .Select(f => new
            {
                User = f.Following,
                LastMessage = _dbContext.DirectMessages
                    .Where(m =>
                        (m.SenderId == userId && m.RecipientId == f.FollowingId) ||
                        (m.SenderId == f.FollowingId && m.RecipientId == userId))
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefault(),
                UnreadCount = _dbContext.DirectMessages
                    .Count(m => m.SenderId == f.FollowingId && m.RecipientId == userId && m.ReadAt == null),
            })
            .ToListAsync();

        var result = following
            .OrderByDescending(x => x.LastMessage?.CreatedAt ?? x.User.CreatedAt)
            .Select(x => new FollowingUserItem
            {
                UserId = x.User.Id,
                FirstName = x.User.FirstName ?? string.Empty,
                LastName = x.User.LastName ?? string.Empty,
                LastMessagePreview = x.LastMessage == null ? null
                    : x.LastMessage.Body.Length > 60
                        ? x.LastMessage.Body[..60] + "…"
                        : x.LastMessage.Body,
                LastMessageAt = x.LastMessage?.CreatedAt,
                HasUnread = x.UnreadCount > 0,
            })
            .ToList();

        return Ok(result);
    }

    // GET /api/follows/followers
    // Returns users who follow the current user, sorted by most recent message activity
    [HttpGet("followers")]
    public async Task<IActionResult> GetFollowers()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var followers = await _dbContext.UserFollows
            .AsNoTracking()
            .Where(f => f.FollowingId == userId)
            .Select(f => new
            {
                User = f.Follower,
                LastMessage = _dbContext.DirectMessages
                    .Where(m =>
                        (m.SenderId == userId && m.RecipientId == f.FollowerId) ||
                        (m.SenderId == f.FollowerId && m.RecipientId == userId))
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefault(),
                UnreadCount = _dbContext.DirectMessages
                    .Count(m => m.SenderId == f.FollowerId && m.RecipientId == userId && m.ReadAt == null),
            })
            .ToListAsync();

        var result = followers
            .OrderByDescending(x => x.LastMessage?.CreatedAt ?? x.User.CreatedAt)
            .Select(x => new FollowingUserItem
            {
                UserId = x.User.Id,
                FirstName = x.User.FirstName ?? string.Empty,
                LastName = x.User.LastName ?? string.Empty,
                LastMessagePreview = x.LastMessage == null ? null
                    : x.LastMessage.Body.Length > 60
                        ? x.LastMessage.Body[..60] + "…"
                        : x.LastMessage.Body,
                LastMessageAt = x.LastMessage?.CreatedAt,
                HasUnread = x.UnreadCount > 0,
            })
            .ToList();

        return Ok(result);
    }

    // POST /api/follows/{userId}  — follow a user
    [HttpPost("{userId:long}")]
    public async Task<IActionResult> Follow(long userId)
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        if (myId == userId)
            return BadRequest("You cannot follow yourself.");

        var targetExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
        if (!targetExists)
            return NotFound("User not found.");

        var already = await _dbContext.UserFollows
            .AnyAsync(f => f.FollowerId == myId && f.FollowingId == userId);

        if (already)
            return Conflict("Already following.");

        _dbContext.UserFollows.Add(new UserFollow
        {
            FollowerId = myId,
            FollowingId = userId,
            CreatedAt = DateTime.UtcNow,
        });

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Followed." });
    }

    // DELETE /api/follows/{userId}  — unfollow a user
    [HttpDelete("{userId:long}")]
    public async Task<IActionResult> Unfollow(long userId)
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        var follow = await _dbContext.UserFollows
            .FirstOrDefaultAsync(f => f.FollowerId == myId && f.FollowingId == userId);

        if (follow is null)
            return NotFound("Not following this user.");

        _dbContext.UserFollows.Remove(follow);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/follows/search?q=name  — find users to follow
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q = "")
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return BadRequest("Query must be at least 2 characters.");

        var alreadyFollowing = await _dbContext.UserFollows
            .Where(f => f.FollowerId == myId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var users = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id != myId &&
                (u.FirstName != null && u.FirstName.Contains(q) ||
                 u.LastName != null && u.LastName.Contains(q) ||
                 u.Email != null && u.Email.Contains(q)))
            .Take(20)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                IsFollowing = alreadyFollowing.Contains(u.Id),
            })
            .ToListAsync();

        return Ok(users);
    }
}
