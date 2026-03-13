using BetterLink.Backend.Data;
using BetterLink.Backend.Models;
using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext dbContext,
        IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register/student")]
    public async Task<ActionResult<AuthResponse>> RegisterStudent([FromBody] RegisterStudentRequest request)
    {
        if (await _userManager.Users.AnyAsync(u => u.Email == request.Email))
        {
            return Conflict("A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault(),
            LastName = request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault(),
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(createResult.Errors);
        }

        await _userManager.AddToRoleAsync(user, "Student");

        _dbContext.StudentProfiles.Add(new StudentProfile
        {
            UserId = user.Id,
            University = request.University,
            ProgramName = request.ProgramName,
            GraduationYear = request.GraduationYear,
            Gpa = request.Gpa,
            Skills = request.Skills,
            ResumeUrl = request.ResumeUrl,
            PortfolioUrl = request.PortfolioUrl
        });

        await _dbContext.SaveChangesAsync();

        var token = await _jwtTokenService.GenerateTokenAsync(user);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Role = "Student"
        });
    }

    [HttpPost("register/employer")]
    public async Task<ActionResult<AuthResponse>> RegisterEmployer([FromBody] RegisterEmployerRequest request)
    {
        if (await _userManager.Users.AnyAsync(u => u.Email == request.Email))
        {
            return Conflict("A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault(),
            LastName = request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault(),
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(createResult.Errors);
        }

        await _userManager.AddToRoleAsync(user, "Employer");

        _dbContext.EmployerProfiles.Add(new EmployerProfile
        {
            UserId = user.Id,
            OrganizationName = request.OrganizationName,
            Industry = request.Industry,
            Website = request.Website,
            Location = request.Location,
            IsVerified = false
        });

        await _dbContext.SaveChangesAsync();

        var token = await _jwtTokenService.GenerateTokenAsync(user);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Role = "Employer"
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!passwordCheck.Succeeded)
        {
            return Unauthorized("Invalid credentials.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _jwtTokenService.GenerateTokenAsync(user);

        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Role = roles.FirstOrDefault() ?? "Student"
        });
    }
}
