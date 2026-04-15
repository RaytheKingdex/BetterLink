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
    private static readonly HashSet<string> AllowedImageMimes =
        ["image/jpeg", "image/png", "image/gif", "image/webp"];
    private static readonly HashSet<string> AllowedVideoMimes =
        ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    private static readonly HashSet<string> AllowedDocMimes =
        ["application/pdf",
         "application/msword",
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
         "application/vnd.ms-excel",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
         "application/vnd.ms-powerpoint",
         "application/vnd.openxmlformats-officedocument.presentationml.presentation",
         "text/plain"];

    private const long MaxFileBytes = 50 * 1024 * 1024; // 50 MB

    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _env;

    public CommunitiesController(AppDbContext dbContext, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _env = env;
    }

    // GET /api/communities — browse all communities
    [HttpGet]
    public async Task<IActionResult> GetAllCommunities([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Communities.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(c => c.Name.Contains(q));

        var communities = await query
            .OrderByDescending(c => c.Members.Count)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
    // GET /api/communities?take=20
    [HttpGet]
    public async Task<IActionResult> GetCommunities([FromQuery] int take = 20)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var safeTake = Math.Clamp(take, 1, 100);

        var communities = await _dbContext.Communities
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Take(safeTake)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                MemberCount = c.Members.Count,
                IsMember = c.Members.Any(m => m.UserId == userId),
                IsCreator = c.CreatedByUserId == userId,
                c.CreatedAt,
                MemberCount = c.Members.Count,
                IsMember = c.Members.Any(m => m.UserId == userId)
            })
            .ToListAsync();

        return Ok(communities);
    }

    // POST /api/communities — create + auto-join creator
    [HttpPost]
    public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

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

        // Auto-join creator as admin
        _dbContext.CommunityMembers.Add(new CommunityMember
        {
            CommunityId = community.Id,
            UserId = userId,
            Role = "admin",
            JoinedAt = DateTime.UtcNow
        });
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCommunityById), new { id = community.Id }, new { community.Id });
    }

    // GET /api/communities/:id
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetCommunityById(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var community = await _dbContext.Communities
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                c.CreatedAt,
                c.CreatedByUserId,
                MemberCount = c.Members.Count,
                IsMember = c.Members.Any(m => m.UserId == userId),
            })
            .FirstOrDefaultAsync();

        if (community is null)
            return NotFound();

        return Ok(community);
    }

    // DELETE /api/communities/:id — creator only
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteCommunity(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var community = await _dbContext.Communities.FirstOrDefaultAsync(c => c.Id == id);
        if (community is null)
            return NotFound();

        if (community.CreatedByUserId != userId)
            return Forbid();

        _dbContext.Communities.Remove(community);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/communities/:id/join
    [HttpPost("{id:long}/join")]
    public async Task<IActionResult> JoinCommunity(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var exists = await _dbContext.Communities.AnyAsync(c => c.Id == id);
        if (!exists)
            return NotFound("Community not found.");

        var alreadyMember = await _dbContext.CommunityMembers.AnyAsync(cm => cm.CommunityId == id && cm.UserId == userId);
        if (alreadyMember)
            return Conflict("You are already a member of this community.");

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

    [HttpPost("{id:long}/messages")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(60 * 1024 * 1024)]
    public async Task<IActionResult> CreateMessage(long id, [FromForm] string? body, IFormFile? attachment)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var isMember = await _dbContext.CommunityMembers
            .AnyAsync(cm => cm.CommunityId == id && cm.UserId == userId);
        if (!isMember)
            return Forbid();

        var trimmedBody = body?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(trimmedBody) && attachment is null)
            return BadRequest("Message must have text or an attachment.");

        string? attachUrl = null, attachType = null, attachMime = null, attachName = null;

        if (attachment is not null)
        {
            if (attachment.Length > MaxFileBytes)
                return BadRequest("File exceeds the 50 MB limit.");

            var mime = attachment.ContentType.ToLowerInvariant();
            if (AllowedImageMimes.Contains(mime))
                attachType = "image";
            else if (AllowedVideoMimes.Contains(mime))
                attachType = "video";
            else if (AllowedDocMimes.Contains(mime))
                attachType = "document";
            else
                return BadRequest($"Unsupported file type: {mime}.");

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(webRoot, "uploads", "community", id.ToString());
            Directory.CreateDirectory(uploadDir);

            var ext = Path.GetExtension(attachment.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(ext)) ext = ".bin";
            var uniqueName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadDir, uniqueName);

            await using (var stream = System.IO.File.Create(filePath))
                await attachment.CopyToAsync(stream);

            attachUrl = $"/uploads/community/{id}/{uniqueName}";
            attachMime = mime;
            attachName = attachment.FileName;
        }

        var message = new CommunityMessage
        {
            CommunityId = id,
            SenderUserId = userId,
            Body = trimmedBody,
            AttachmentUrl = attachUrl,
            AttachmentType = attachType,
            AttachmentMimeType = attachMime,
            AttachmentName = attachName,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.CommunityMessages.Add(message);
        await _dbContext.SaveChangesAsync();

        var sender = await _dbContext.Users.FindAsync(userId);

        return Ok(new CommunityMessageItem
        {
            Id = message.Id,
            SenderUserId = userId,
            SenderFirstName = sender?.FirstName ?? string.Empty,
            SenderLastName = sender?.LastName ?? string.Empty,
            Body = message.Body,
            AttachmentUrl = attachUrl,
            AttachmentType = attachType,
            AttachmentMimeType = attachMime,
            AttachmentName = attachName,
            CreatedAt = message.CreatedAt,
        });
    }

    // DELETE /api/communities/:id/messages/:msgId — sender only
    [HttpDelete("{id:long}/messages/{msgId:long}")]
    public async Task<IActionResult> DeleteMessage(long id, long msgId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var message = await _dbContext.CommunityMessages
            .FirstOrDefaultAsync(m => m.Id == msgId && m.CommunityId == id);

        if (message is null)
            return NotFound("Message not found.");

        if (message.SenderUserId != userId)
            return Forbid();

        _dbContext.CommunityMessages.Remove(message);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}
