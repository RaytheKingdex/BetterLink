using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Feed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController : ControllerBase
{
    private static readonly HashSet<string> AllowedImageMimes =
        ["image/jpeg", "image/png", "image/gif", "image/webp"];
    private static readonly HashSet<string> AllowedVideoMimes =
        ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

    private const long MaxImageBytes = 10 * 1024 * 1024;   // 10 MB
    private const long MaxVideoBytes = 100 * 1024 * 1024;  // 100 MB
    private const int MaxMediaPerPost = 4;

    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _env;

    public FeedController(AppDbContext dbContext, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _env = env;
    }

    // GET /api/feed?page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        pageSize = Math.Clamp(pageSize, 1, 50);
        var skip = (page - 1) * pageSize;

        var posts = await _dbContext.Posts
            .AsNoTracking()
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
                LikedByMe = p.Likes.Any(l => l.UserId == userId),
                CommentCount = p.Comments.Count,
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

    // POST /api/feed  (multipart/form-data: content + up to 4 media files)
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(440 * 1024 * 1024)] // 440 MB ceiling for the whole request
    public async Task<IActionResult> CreatePost([FromForm] string content, IFormFileCollection? media)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(content) || content.Length > 1000)
            return BadRequest("Content must be between 1 and 1000 characters.");

        var files = media?.ToList() ?? [];
        if (files.Count > MaxMediaPerPost)
            return BadRequest($"Maximum {MaxMediaPerPost} attachments per post.");

        // Validate each file before doing anything
        foreach (var file in files)
        {
            var mime = file.ContentType.ToLowerInvariant();
            if (AllowedImageMimes.Contains(mime))
            {
                if (file.Length > MaxImageBytes)
                    return BadRequest($"{file.FileName} exceeds the 10 MB image limit.");
            }
            else if (AllowedVideoMimes.Contains(mime))
            {
                if (file.Length > MaxVideoBytes)
                    return BadRequest($"{file.FileName} exceeds the 100 MB video limit.");
            }
            else
            {
                return BadRequest($"Unsupported file type: {mime}.");
            }
        }

        // Create the post record first to get its ID
        var post = new Post
        {
            UserId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.Posts.Add(post);
        await _dbContext.SaveChangesAsync();

        // Save media files
        var mediaItems = new List<PostMedia>();
        if (files.Count > 0)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(webRoot, "uploads", "posts", post.Id.ToString());
            Directory.CreateDirectory(uploadDir);

            foreach (var file in files)
            {
                var mime = file.ContentType.ToLowerInvariant();
                var mediaType = AllowedImageMimes.Contains(mime) ? "image" : "video";
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(ext)) ext = mediaType == "image" ? ".jpg" : ".mp4";

                var uniqueName = $"{Guid.NewGuid():N}{ext}";
                var filePath = Path.Combine(uploadDir, uniqueName);

                await using (var stream = System.IO.File.Create(filePath))
                {
                    await file.CopyToAsync(stream);
                }

                var item = new PostMedia
                {
                    PostId = post.Id,
                    MediaType = mediaType,
                    FileName = uniqueName,
                    RelativeUrl = $"/uploads/posts/{post.Id}/{uniqueName}",
                    MimeType = mime,
                    FileSize = file.Length,
                    CreatedAt = DateTime.UtcNow,
                };
                _dbContext.PostMedia.Add(item);
                mediaItems.Add(item);
            }

            await _dbContext.SaveChangesAsync();
        }

        var user = await _dbContext.Users.FindAsync(userId);
        return CreatedAtAction(nameof(GetFeed), null, new FeedPostItem
        {
            Id = post.Id,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            AuthorId = userId,
            AuthorFirstName = user?.FirstName ?? string.Empty,
            AuthorLastName = user?.LastName ?? string.Empty,
            LikeCount = 0,
            LikedByMe = false,
            Media = mediaItems.Select(m => new PostMediaItem
            {
                Id = m.Id,
                Url = m.RelativeUrl,
                MediaType = m.MediaType,
                MimeType = m.MimeType,
            }).ToList(),
        });
    }

    // DELETE /api/feed/{id} — delete own post
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeletePost(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var post = await _dbContext.Posts.FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
            return NotFound("Post not found.");

        if (post.UserId != userId)
            return Forbid();

        _dbContext.Posts.Remove(post);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/feed/{id}/comments
    [HttpGet("{id:long}/comments")]
    public async Task<IActionResult> GetComments(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out _)) return Unauthorized();

        var exists = await _dbContext.Posts.AnyAsync(p => p.Id == id);
        if (!exists) return NotFound("Post not found.");

        var comments = await _dbContext.PostComments
            .AsNoTracking()
            .Where(c => c.PostId == id)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new PostCommentItem
            {
                Id = c.Id,
                PostId = c.PostId,
                AuthorId = c.UserId,
                AuthorFirstName = c.User.FirstName ?? string.Empty,
                AuthorLastName = c.User.LastName ?? string.Empty,
                Body = c.Body,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST /api/feed/{id}/comments
    [HttpPost("{id:long}/comments")]
    public async Task<IActionResult> AddComment(long id, [FromBody] AddCommentRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Body) || request.Body.Trim().Length > 500)
            return BadRequest("Comment must be between 1 and 500 characters.");

        var exists = await _dbContext.Posts.AnyAsync(p => p.Id == id);
        if (!exists) return NotFound("Post not found.");

        var comment = new PostComment
        {
            PostId = id,
            UserId = userId,
            Body = request.Body.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.PostComments.Add(comment);
        await _dbContext.SaveChangesAsync();

        var user = await _dbContext.Users.FindAsync(userId);
        return Ok(new PostCommentItem
        {
            Id = comment.Id,
            PostId = id,
            AuthorId = userId,
            AuthorFirstName = user?.FirstName ?? string.Empty,
            AuthorLastName = user?.LastName ?? string.Empty,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
        });
    }

    // DELETE /api/feed/{id}/comments/{commentId}
    [HttpDelete("{id:long}/comments/{commentId:long}")]
    public async Task<IActionResult> DeleteComment(long id, long commentId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var comment = await _dbContext.PostComments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == id);

        if (comment is null) return NotFound("Comment not found.");
        if (comment.UserId != userId) return Forbid();

        _dbContext.PostComments.Remove(comment);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/feed/{id}/like  — toggles like
    [HttpPost("{id:long}/like")]
    public async Task<IActionResult> ToggleLike(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var postExists = await _dbContext.Posts.AnyAsync(p => p.Id == id);
        if (!postExists)
            return NotFound("Post not found.");

        var existing = await _dbContext.PostLikes
            .FirstOrDefaultAsync(pl => pl.PostId == id && pl.UserId == userId);

        if (existing is not null)
        {
            _dbContext.PostLikes.Remove(existing);
            await _dbContext.SaveChangesAsync();
            var count = await _dbContext.PostLikes.CountAsync(pl => pl.PostId == id);
            return Ok(new { liked = false, likeCount = count });
        }
        else
        {
            _dbContext.PostLikes.Add(new PostLike
            {
                PostId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            });
            await _dbContext.SaveChangesAsync();
            var count = await _dbContext.PostLikes.CountAsync(pl => pl.PostId == id);
            return Ok(new { liked = true, likeCount = count });
        }
    }
}
