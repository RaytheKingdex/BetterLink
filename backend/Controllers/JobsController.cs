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

    // GET /api/jobs/mine — employer's own listings with applicant counts
    [Authorize(Roles = "Employer")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyJobs()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null) return BadRequest("Employer profile not found.");

        var jobs = await _dbContext.Jobs
            .AsNoTracking()
            .Where(j => j.EmployerId == employer.Id)
            .OrderByDescending(j => j.PostedDate)
            .Select(j => new MyJobListItem
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Status = j.Status,
                EmploymentType = j.EmploymentType,
                Location = j.Location,
                PostedDate = j.PostedDate,
                ApplicationDeadline = j.ApplicationDeadline,
                ApplicantCount = j.Applications.Count,
            })
            .ToListAsync();

        return Ok(jobs);
    }

    // GET /api/jobs/{id}/applicants?sortBy=date_desc|date_asc|gpa_desc|gpa_asc|grad_asc|grad_desc
    [Authorize(Roles = "Employer")]
    [HttpGet("{id:long}/applicants")]
    public async Task<IActionResult> GetApplicants(long id, [FromQuery] string sortBy = "date_desc")
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null) return BadRequest("Employer profile not found.");

        var jobExists = await _dbContext.Jobs.AnyAsync(j => j.Id == id && j.EmployerId == employer.Id);
        if (!jobExists) return NotFound("Job not found.");

        var raw = await _dbContext.JobApplications
            .AsNoTracking()
            .Where(a => a.JobId == id)
            .Include(a => a.StudentUser).ThenInclude(u => u.StudentProfile)
            .ToListAsync();

        var items = raw.Select(a => new JobApplicantItem
        {
            ApplicationId = a.Id,
            StudentUserId = a.StudentUserId,
            DisplayId = a.StudentUser.DisplayId,
            FirstName = a.StudentUser.FirstName ?? string.Empty,
            LastName = a.StudentUser.LastName ?? string.Empty,
            Email = a.StudentUser.Email ?? string.Empty,
            University = a.StudentUser.StudentProfile?.University ?? string.Empty,
            ProgramName = a.StudentUser.StudentProfile?.ProgramName ?? string.Empty,
            GraduationYear = a.StudentUser.StudentProfile?.GraduationYear,
            Gpa = a.StudentUser.StudentProfile?.Gpa,
            Skills = a.StudentUser.StudentProfile?.Skills,
            ResumeUrl = a.StudentUser.StudentProfile?.ResumeUrl,
            CoverLetter = a.CoverLetter,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
        }).ToList();

        items = sortBy switch
        {
            "gpa_desc"  => [.. items.OrderByDescending(x => x.Gpa ?? -1)],
            "gpa_asc"   => [.. items.OrderBy(x => x.Gpa ?? -1)],
            "grad_asc"  => [.. items.OrderBy(x => x.GraduationYear ?? 9999)],
            "grad_desc" => [.. items.OrderByDescending(x => x.GraduationYear ?? 0)],
            "date_asc"  => [.. items.OrderBy(x => x.AppliedAt)],
            _           => [.. items.OrderByDescending(x => x.AppliedAt)],
        };

        return Ok(items);
    }

    // PUT /api/jobs/{id}/applicants/{applicationId}/status — accept or reject applicant
    [Authorize(Roles = "Employer")]
    [HttpPut("{id:long}/applicants/{applicationId:long}/status")]
    public async Task<IActionResult> UpdateApplicationStatus(
        long id, long applicationId, [FromBody] UpdateApplicationStatusRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null) return BadRequest("Employer profile not found.");

        // Confirm the job belongs to this employer
        var job = await _dbContext.Jobs
            .Include(j => j.Employer).ThenInclude(e => e.User)
            .FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == employer.Id);
        if (job is null) return NotFound("Job not found.");

        var application = await _dbContext.JobApplications
            .Include(a => a.StudentUser)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.JobId == id);
        if (application is null) return NotFound("Application not found.");

        var newStatus = request.Status.ToLowerInvariant();
        if (newStatus != "accepted" && newStatus != "rejected")
            return BadRequest("Status must be 'accepted' or 'rejected'.");

        application.Status = newStatus;
        application.UpdatedAt = DateTime.UtcNow;

        // Send automated DM if hired
        if (newStatus == "accepted")
        {
            var employerName = $"{job.Employer.User.FirstName} {job.Employer.User.LastName}".Trim();
            if (string.IsNullOrEmpty(employerName)) employerName = job.Employer.OrganizationName;

            var messageBody =
                $"🎉 Congratulations! You have been hired for the position of \"{job.Title}\" " +
                $"at {job.Employer.OrganizationName}. " +
                $"Please check your email or reach out to us for next steps. Welcome aboard!";

            _dbContext.DirectMessages.Add(new DirectMessage
            {
                SenderId = userId,
                RecipientId = application.StudentUserId,
                Body = messageBody,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _dbContext.SaveChangesAsync();
        return Ok(new { application.Id, application.Status });
    }

    // PUT /api/jobs/{id} — edit own job listing
    [Authorize(Roles = "Employer")]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateJob(long id, [FromBody] UpdateJobRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null) return BadRequest("Employer profile not found.");

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == employer.Id);
        if (job is null) return NotFound("Job not found.");

        job.Title = request.Title;
        job.Description = request.Description;
        job.Location = request.Location;
        job.EmploymentType = request.EmploymentType;
        job.Status = request.Status;
        job.ApplicationDeadline = request.ApplicationDeadline;
        job.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/jobs/{id} — delete own job listing
    [Authorize(Roles = "Employer")]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteJob(long id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId)) return Unauthorized();

        var employer = await _dbContext.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employer is null) return BadRequest("Employer profile not found.");

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.EmployerId == employer.Id);
        if (job is null) return NotFound("Job not found.");

        _dbContext.Jobs.Remove(job);
        await _dbContext.SaveChangesAsync();
        return NoContent();
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
