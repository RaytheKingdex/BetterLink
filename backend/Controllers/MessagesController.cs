using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Messages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public MessagesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/messages/conversations
    // Returns all users the current user has exchanged DMs with, ordered by most recent message
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        // Find all distinct user IDs the current user has messaged or been messaged by
        var partnerIds = await _dbContext.DirectMessages
            .AsNoTracking()
            .Where(m => m.SenderId == myId || m.RecipientId == myId)
            .Select(m => m.SenderId == myId ? m.RecipientId : m.SenderId)
            .Distinct()
            .ToListAsync();

        if (partnerIds.Count == 0)
            return Ok(new List<object>());

        var partners = await _dbContext.Users
            .AsNoTracking()
            .Where(u => partnerIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToListAsync();

        var result = partners.Select(p =>
        {
            var lastMsg = _dbContext.DirectMessages
                .AsNoTracking()
                .Where(m =>
                    (m.SenderId == myId && m.RecipientId == p.Id) ||
                    (m.SenderId == p.Id && m.RecipientId == myId))
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefault();

            var unread = _dbContext.DirectMessages
                .Count(m => m.SenderId == p.Id && m.RecipientId == myId && m.ReadAt == null);

            return new
            {
                UserId = p.Id,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                LastMessagePreview = lastMsg == null ? (string?)null
                    : lastMsg.Body.Length > 60 ? lastMsg.Body[..60] + "…" : lastMsg.Body,
                LastMessageAt = lastMsg?.CreatedAt,
                HasUnread = unread > 0,
            };
        })
        .OrderByDescending(x => x.LastMessageAt)
        .ToList();

        return Ok(result);
    }

    // GET /api/messages/{userId}?page=1&pageSize=40
    // Returns the DM thread between the current user and the given user
    [HttpGet("{userId:long}")]
    public async Task<IActionResult> GetThread(long userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 40)
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        pageSize = Math.Clamp(pageSize, 1, 100);

        var messages = await _dbContext.DirectMessages
            .AsNoTracking()
            .Where(m =>
                (m.SenderId == myId && m.RecipientId == userId) ||
                (m.SenderId == userId && m.RecipientId == myId))
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new DirectMessageItem
            {
                Id = m.Id,
                SenderId = m.SenderId,
                Body = m.Body,
                CreatedAt = m.CreatedAt,
                IsRead = m.ReadAt != null,
            })
            .ToListAsync();

        // Mark unread messages sent by the other user as read
        await _dbContext.DirectMessages
            .Where(m => m.SenderId == userId && m.RecipientId == myId && m.ReadAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ReadAt, DateTime.UtcNow));

        // Return in chronological order (oldest first)
        messages.Reverse();
        return Ok(messages);
    }

    // POST /api/messages/{userId}  — send a DM
    [HttpPost("{userId:long}")]
    public async Task<IActionResult> SendMessage(long userId, [FromBody] SendMessageRequest request)
    {
        var meValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(meValue, out var myId))
            return Unauthorized();

        if (myId == userId)
            return BadRequest("You cannot message yourself.");

        var recipientExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
        if (!recipientExists)
            return NotFound("User not found.");

        var message = new DirectMessage
        {
            SenderId = myId,
            RecipientId = userId,
            Body = request.Body.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.DirectMessages.Add(message);
        await _dbContext.SaveChangesAsync();

        return Ok(new DirectMessageItem
        {
            Id = message.Id,
            SenderId = myId,
            Body = message.Body,
            CreatedAt = message.CreatedAt,
            IsRead = false,
        });
    }
}
