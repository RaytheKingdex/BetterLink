using BetterLink.Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Data;

public static class DevelopmentDataSeeder
{
    private const string DemoPassword = "Password1";
    private const string StudentEmail = "student.demo@betterlink.local";
    private const string EmployerEmail = "employer.demo@betterlink.local";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var studentUser = await EnsureStudentUserAsync(userManager);
        var employerUser = await EnsureEmployerUserAsync(userManager);

        await EnsureStudentProfileAsync(db, studentUser);
        var employerProfile = await EnsureEmployerProfileAsync(db, employerUser);

        await EnsureJobsAsync(db, employerProfile);
        await EnsureCommunityAsync(db, studentUser, employerUser);
        await EnsureSampleApplicationAsync(db, studentUser);
    }

    private static async Task<ApplicationUser> EnsureStudentUserAsync(UserManager<ApplicationUser> userManager)
    {
        var existing = await userManager.FindByEmailAsync(StudentEmail);
        if (existing is not null)
        {
            return existing;
        }

        var user = new ApplicationUser
        {
            UserName = StudentEmail,
            Email = StudentEmail,
            EmailConfirmed = true,
            FirstName = "Alicia",
            LastName = "Brown"
        };

        var createResult = await userManager.CreateAsync(user, DemoPassword);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException($"Failed creating demo student: {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
        }

        await userManager.AddToRoleAsync(user, "Student");
        return user;
    }

    private static async Task<ApplicationUser> EnsureEmployerUserAsync(UserManager<ApplicationUser> userManager)
    {
        var existing = await userManager.FindByEmailAsync(EmployerEmail);
        if (existing is not null)
        {
            return existing;
        }

        var user = new ApplicationUser
        {
            UserName = EmployerEmail,
            Email = EmployerEmail,
            EmailConfirmed = true,
            FirstName = "Marcus",
            LastName = "Thompson"
        };

        var createResult = await userManager.CreateAsync(user, DemoPassword);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException($"Failed creating demo employer: {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
        }

        await userManager.AddToRoleAsync(user, "Employer");
        return user;
    }

    private static async Task EnsureStudentProfileAsync(AppDbContext db, ApplicationUser studentUser)
    {
        var exists = await db.StudentProfiles.AnyAsync(s => s.UserId == studentUser.Id);
        if (exists)
        {
            return;
        }

        db.StudentProfiles.Add(new StudentProfile
        {
            UserId = studentUser.Id,
            University = "Northern Caribbean University",
            ProgramName = "Computer Science",
            GraduationYear = DateTime.UtcNow.Year + 1,
            Gpa = 3.65m,
            Skills = "C#, ASP.NET Core, React Native, SQL"
        });

        await db.SaveChangesAsync();
    }

    private static async Task<EmployerProfile> EnsureEmployerProfileAsync(AppDbContext db, ApplicationUser employerUser)
    {
        var existing = await db.EmployerProfiles.FirstOrDefaultAsync(e => e.UserId == employerUser.Id);
        if (existing is not null)
        {
            return existing;
        }

        var profile = new EmployerProfile
        {
            UserId = employerUser.Id,
            OrganizationName = "Kingston Tech Labs",
            Industry = "Software",
            Website = "https://kingstontechlabs.example",
            Location = "Kingston, Jamaica",
            IsVerified = true
        };

        db.EmployerProfiles.Add(profile);
        await db.SaveChangesAsync();
        return profile;
    }

    private static async Task EnsureJobsAsync(AppDbContext db, EmployerProfile employerProfile)
    {
        if (await db.Jobs.AnyAsync())
        {
            return;
        }

        db.Jobs.AddRange(
            new Job
            {
                EmployerId = employerProfile.Id,
                Title = "Junior Mobile Developer Intern",
                Description = "Build and improve mobile features for BetterLink.",
                Location = "Mandeville, Jamaica",
                EmploymentType = "internship",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(30)
            },
            new Job
            {
                EmployerId = employerProfile.Id,
                Title = "Backend API Intern",
                Description = "Support ASP.NET Core APIs and integration testing.",
                Location = "Remote",
                EmploymentType = "internship",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(45)
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task EnsureCommunityAsync(AppDbContext db, ApplicationUser studentUser, ApplicationUser employerUser)
    {
        var community = await db.Communities.FirstOrDefaultAsync(c => c.Name == "BetterLink Demo Community");
        if (community is null)
        {
            community = new Community
            {
                Name = "BetterLink Demo Community",
                Description = "A starter community for testing posts and chat.",
                CreatedByUserId = studentUser.Id
            };
            db.Communities.Add(community);
            await db.SaveChangesAsync();
        }

        var hasStudentMember = await db.CommunityMembers.AnyAsync(cm => cm.CommunityId == community.Id && cm.UserId == studentUser.Id);
        if (!hasStudentMember)
        {
            db.CommunityMembers.Add(new CommunityMember
            {
                CommunityId = community.Id,
                UserId = studentUser.Id,
                Role = "owner"
            });
        }

        var hasEmployerMember = await db.CommunityMembers.AnyAsync(cm => cm.CommunityId == community.Id && cm.UserId == employerUser.Id);
        if (!hasEmployerMember)
        {
            db.CommunityMembers.Add(new CommunityMember
            {
                CommunityId = community.Id,
                UserId = employerUser.Id,
                Role = "member"
            });
        }

        var hasMessage = await db.CommunityMessages.AnyAsync(m => m.CommunityId == community.Id);
        if (!hasMessage)
        {
            db.CommunityMessages.Add(new CommunityMessage
            {
                CommunityId = community.Id,
                SenderUserId = studentUser.Id,
                Body = "Welcome to BetterLink demo testing."
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsureSampleApplicationAsync(AppDbContext db, ApplicationUser studentUser)
    {
        var firstJob = await db.Jobs.OrderBy(j => j.Id).FirstOrDefaultAsync();
        if (firstJob is null)
        {
            return;
        }

        var exists = await db.JobApplications.AnyAsync(a => a.JobId == firstJob.Id && a.StudentUserId == studentUser.Id);
        if (exists)
        {
            return;
        }

        db.JobApplications.Add(new JobApplication
        {
            JobId = firstJob.Id,
            StudentUserId = studentUser.Id,
            CoverLetter = "I am eager to contribute and learn in this internship.",
            Status = "submitted"
        });

        await db.SaveChangesAsync();
    }
}
