using BetterLink.Backend.Data;
using BetterLink.Backend.Models.DTOs.Applications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ApplicationsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<MyApplicationItem>>> GetMyApplications()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var applications = await _dbContext.JobApplications
            .AsNoTracking()
            .Where(a => a.StudentUserId == userId)
            .Include(a => a.Job)
            .ThenInclude(j => j.Employer)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new MyApplicationItem
            {
                ApplicationId = a.Id,
                JobId = a.JobId,
                JobTitle = a.Job.Title,
                EmployerName = a.Job.Employer.OrganizationName,
                Status = a.Status,
                AppliedAt = a.AppliedAt
            })
            .ToListAsync();

        return Ok(applications);
    }
}
