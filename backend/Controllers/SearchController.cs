using BetterLink.Backend.Data;
using BetterLink.Backend.Models.DTOs.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public SearchController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/search/students?q=  — Employer searches for students
    [HttpGet("students")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> SearchStudents([FromQuery] string q = "")
    {
        var query = _dbContext.StudentProfiles
            .AsNoTracking()
            .Include(s => s.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var lower = q.ToLower();
            query = query.Where(s =>
                (s.User.FirstName != null && s.User.FirstName.ToLower().Contains(lower)) ||
                (s.User.LastName != null && s.User.LastName.ToLower().Contains(lower)) ||
                s.University.ToLower().Contains(lower) ||
                s.ProgramName.ToLower().Contains(lower) ||
                (s.Skills != null && s.Skills.ToLower().Contains(lower)));
        }

        var results = await query
            .OrderBy(s => s.User.FirstName)
            .Take(30)
            .Select(s => new StudentSearchResult
            {
                UserId = s.User.Id,
                DisplayId = s.User.DisplayId,
                FirstName = s.User.FirstName ?? string.Empty,
                LastName = s.User.LastName ?? string.Empty,
                University = s.University,
                ProgramName = s.ProgramName,
                GraduationYear = s.GraduationYear,
                Skills = s.Skills,
            })
            .ToListAsync();

        return Ok(results);
    }

    // GET /api/search/employers?q=  — Student searches for employers
    [HttpGet("employers")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SearchEmployers([FromQuery] string q = "")
    {
        var query = _dbContext.EmployerProfiles
            .AsNoTracking()
            .Include(e => e.User)
            .Include(e => e.Jobs)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var lower = q.ToLower();
            query = query.Where(e =>
                (e.User.FirstName != null && e.User.FirstName.ToLower().Contains(lower)) ||
                (e.User.LastName != null && e.User.LastName.ToLower().Contains(lower)) ||
                e.OrganizationName.ToLower().Contains(lower) ||
                (e.Industry != null && e.Industry.ToLower().Contains(lower)) ||
                (e.Location != null && e.Location.ToLower().Contains(lower)));
        }

        var results = await query
            .OrderBy(e => e.OrganizationName)
            .Take(30)
            .Select(e => new EmployerSearchResult
            {
                UserId = e.User.Id,
                DisplayId = e.User.DisplayId,
                FirstName = e.User.FirstName ?? string.Empty,
                LastName = e.User.LastName ?? string.Empty,
                OrganizationName = e.OrganizationName,
                Industry = e.Industry,
                Location = e.Location,
                IsVerified = e.IsVerified,
                ActiveJobCount = e.Jobs.Count(j => j.Status == "open"),
            })
            .ToListAsync();

        return Ok(results);
    }
}
