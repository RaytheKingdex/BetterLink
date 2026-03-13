using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Applications;
using BetterLink.Backend.Models.DTOs.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public JobsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobListItem>>> GetJobs([FromQuery] string? title, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .Where(j => j.Status == "open");

        if (!string.IsNullOrWhiteSpace(title))
        {
            query = query.Where(j => j.Title.Contains(title));
        }

        var jobs = await query
            .OrderByDescending(j => j.PostedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobListItem
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                EmploymentType = j.EmploymentType,
                Status = j.Status,
                Location = j.Location,
                PostedDate = j.PostedDate,
                EmployerName = j.Employer.OrganizationName
            })
            .ToListAsync();

        return Ok(jobs);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<JobListItem>> GetJobById(long id)
    {
        var job = await _dbContext.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .Where(j => j.Id == id)
            .Select(j => new JobListItem
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                EmploymentType = j.EmploymentType,
                Status = j.Status,
                Location = j.Location,
                PostedDate = j.PostedDate,
                EmployerName = j.Employer.OrganizationName
            })
            .FirstOrDefaultAsync();

        if (job is null)
        {
            return NotFound();
        }

        return Ok(job);
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null)
        {
            return BadRequest("Employer profile not found.");
        }

        var job = new Job
        {
            EmployerId = employer.Id,
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            EmploymentType = request.EmploymentType,
            Status = "open",
            ApplicationDeadline = request.ApplicationDeadline,
            PostedDate = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, new { job.Id });
    }

    [Authorize(Roles = "Student")]
    [HttpPost("{id:long}/apply")]
    public async Task<IActionResult> ApplyToJob(long id, [FromBody] ApplyToJobRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.Status == "open");
        if (job is null)
        {
            return NotFound("Job not found or not open.");
        }

        var alreadyApplied = await _dbContext.JobApplications.AnyAsync(a => a.JobId == id && a.StudentUserId == userId);
        if (alreadyApplied)
        {
            return Conflict("You have already applied to this job.");
        }

        _dbContext.JobApplications.Add(new JobApplication
        {
            JobId = id,
            StudentUserId = userId,
            CoverLetter = request.CoverLetter,
            Status = "submitted",
            AppliedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Application submitted." });
    }
}
