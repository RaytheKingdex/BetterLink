using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Communities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommunitiesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CommunitiesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var community = new Community
        {
            Name = request.Name,
            Description = request.Description,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Communities.Add(community);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCommunityById), new { id = community.Id }, new { community.Id });
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetCommunityById(long id)
    {
        var community = await _dbContext.Communities
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                c.CreatedAt,
                MemberCount = c.Members.Count
            })
            .FirstOrDefaultAsync();

        if (community is null)
        {
            return NotFound();
        }

        return Ok(community);
    }

    [HttpPost("{id:long}/join")]
    public async Task<IActionResult> JoinCommunity(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var exists = await _dbContext.Communities.AnyAsync(c => c.Id == id);
        if (!exists)
        {
            return NotFound("Community not found.");
        }

        var alreadyMember = await _dbContext.CommunityMembers.AnyAsync(cm => cm.CommunityId == id && cm.UserId == userId);
        if (alreadyMember)
        {
            return Conflict("You are already a member of this community.");
        }

        _dbContext.CommunityMembers.Add(new CommunityMember
        {
            CommunityId = id,
            UserId = userId,
            Role = "member",
            JoinedAt = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Joined community." });
    }

            [AllowAnonymous]
            [HttpGet]
            public async Task<IActionResult> GetCommunities([FromQuery] string? search = null, [FromQuery] int take = 20)
            {
                take = Math.Clamp(take, 1, 100);

                var query = _dbContext.Communities
                    .AsNoTracking();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(c => c.Name.Contains(search) || (c.Description != null && c.Description.Contains(search)));
                }

                var communities = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(take)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Description,
                        c.CreatedAt,
                        MemberCount = c.Members.Count
                    })
                    .ToListAsync();

                return Ok(communities);
            }

            [AllowAnonymous]
    [HttpPost("{id:long}/messages")]
    public async Task<IActionResult> CreateMessage(long id, [FromBody] CreateCommunityMessageRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var isMember = await _dbContext.CommunityMembers.AnyAsync(cm => cm.CommunityId == id && cm.UserId == userId);
        if (!isMember)
        {
            return Forbid();
        }

        _dbContext.CommunityMessages.Add(new CommunityMessage
        {
            CommunityId = id,
            SenderUserId = userId,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Message posted." });
    }
}
