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

        var studentUsers = await EnsureStudentUsersAsync(userManager);
        var employerUsers = await EnsureEmployerUsersAsync(userManager);

        foreach (var student in studentUsers)
        {
            await EnsureStudentProfileAsync(db, student);
        }

        var employerProfiles = new List<EmployerProfile>();
        foreach (var employer in employerUsers)
        {
            employerProfiles.Add(await EnsureEmployerProfileAsync(db, employer));
        }

        await EnsureJobsAsync(db, employerProfiles);
        await EnsureCommunitiesAsync(db, studentUsers, employerUsers);
        await EnsureFollowsAsync(db, studentUsers, employerUsers);
        await EnsurePostsAsync(db, studentUsers, employerUsers);
        await EnsureDirectMessagesAsync(db, studentUsers, employerUsers);
        await EnsureSampleApplicationsAsync(db, studentUsers);
    }

    private static async Task<List<ApplicationUser>> EnsureStudentUsersAsync(UserManager<ApplicationUser> userManager)
    {
        var studentSeeds = new[]
        {
            (Email: StudentEmail, FirstName: "Alicia", LastName: "Brown"),
            (Email: "jordan.student@betterlink.local", FirstName: "Jordan", LastName: "Campbell"),
            (Email: "maya.student@betterlink.local", FirstName: "Maya", LastName: "Williams")
        };

        var users = new List<ApplicationUser>();
        foreach (var seed in studentSeeds)
        {
            var existing = await userManager.FindByEmailAsync(seed.Email);
            if (existing is not null)
            {
                users.Add(existing);
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = seed.Email,
                Email = seed.Email,
                EmailConfirmed = true,
                FirstName = seed.FirstName,
                LastName = seed.LastName
            };

            var createResult = await userManager.CreateAsync(user, DemoPassword);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed creating demo student: {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
            }

            await userManager.AddToRoleAsync(user, "Student");
            users.Add(user);
        }

        return users;
    }

    private static async Task<List<ApplicationUser>> EnsureEmployerUsersAsync(UserManager<ApplicationUser> userManager)
    {
        var employerSeeds = new[]
        {
            (Email: EmployerEmail, FirstName: "Marcus", LastName: "Thompson"),
            (Email: "hiring@northshorelabs.local", FirstName: "Danielle", LastName: "Reid"),
            (Email: "talent@islanddigital.local", FirstName: "Kemar", LastName: "Grant")
        };

        var users = new List<ApplicationUser>();
        foreach (var seed in employerSeeds)
        {
            var existing = await userManager.FindByEmailAsync(seed.Email);
            if (existing is not null)
            {
                users.Add(existing);
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = seed.Email,
                Email = seed.Email,
                EmailConfirmed = true,
                FirstName = seed.FirstName,
                LastName = seed.LastName
            };

            var createResult = await userManager.CreateAsync(user, DemoPassword);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed creating demo employer: {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
            }

            await userManager.AddToRoleAsync(user, "Employer");
            users.Add(user);
        }

        return users;
    }

    private static async Task EnsureStudentProfileAsync(AppDbContext db, ApplicationUser studentUser)
    {
        var exists = await db.StudentProfiles.AnyAsync(s => s.UserId == studentUser.Id);
        if (exists)
        {
            return;
        }

        var profile = new StudentProfile
        {
            UserId = studentUser.Id,
            University = "Northern Caribbean University",
            ProgramName = "Computer Science",
            GraduationYear = DateTime.UtcNow.Year + 1,
            Gpa = 3.65m,
            Skills = "C#, ASP.NET Core, React Native, SQL"
        };

        if ((studentUser.FirstName ?? string.Empty).Contains("Jordan", StringComparison.OrdinalIgnoreCase))
        {
            profile.ProgramName = "Information Technology";
            profile.Skills = "UI Design, JavaScript, UX Research";
            profile.Gpa = 3.42m;
        }
        else if ((studentUser.FirstName ?? string.Empty).Contains("Maya", StringComparison.OrdinalIgnoreCase))
        {
            profile.ProgramName = "Software Engineering";
            profile.Skills = "Python, Testing, DevOps";
            profile.Gpa = 3.78m;
        }

        db.StudentProfiles.Add(profile);

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

        if ((employerUser.Email ?? string.Empty).Contains("northshore", StringComparison.OrdinalIgnoreCase))
        {
            profile.OrganizationName = "Northshore Labs";
            profile.Industry = "FinTech";
            profile.Website = "https://northshorelabs.example";
            profile.Location = "Montego Bay, Jamaica";
        }
        else if ((employerUser.Email ?? string.Empty).Contains("islanddigital", StringComparison.OrdinalIgnoreCase))
        {
            profile.OrganizationName = "Island Digital Group";
            profile.Industry = "Digital Services";
            profile.Website = "https://islanddigital.example";
            profile.Location = "Remote";
        }

        db.EmployerProfiles.Add(profile);
        await db.SaveChangesAsync();
        return profile;
    }

    private static async Task EnsureJobsAsync(AppDbContext db, List<EmployerProfile> employerProfiles)
    {
        var seedJobs = new[]
        {
            new Job
            {
                Title = "Junior Mobile Developer Intern",
                Description = "Build and improve mobile features for BetterLink.",
                Location = "Mandeville, Jamaica",
                EmploymentType = "internship",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(30)
            },
            new Job
            {
                Title = "Backend API Intern",
                Description = "Support ASP.NET Core APIs and integration testing.",
                Location = "Remote",
                EmploymentType = "internship",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(45)
            },
            new Job
            {
                Title = "Frontend Web Trainee",
                Description = "Implement responsive UI and improve usability for BetterLink web pages.",
                Location = "Kingston, Jamaica",
                EmploymentType = "part-time",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(28)
            },
            new Job
            {
                Title = "QA Automation Assistant",
                Description = "Create test cases and automate API checks for core platform flows.",
                Location = "Remote",
                EmploymentType = "contract",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(35)
            },
            new Job
            {
                Title = "Community Operations Intern",
                Description = "Support community growth and moderation activities for student engagement.",
                Location = "Spanish Town, Jamaica",
                EmploymentType = "internship",
                Status = "open",
                ApplicationDeadline = DateTime.UtcNow.AddDays(21)
            }
        };

        for (var i = 0; i < seedJobs.Length; i++)
        {
            var title = seedJobs[i].Title;
            var exists = await db.Jobs.AnyAsync(j => j.Title == title);
            if (exists)
            {
                continue;
            }

            var employerProfile = employerProfiles[i % employerProfiles.Count];
            seedJobs[i].EmployerId = employerProfile.Id;
            seedJobs[i].UpdatedAt = DateTime.UtcNow;
            seedJobs[i].PostedDate = DateTime.UtcNow.AddDays(-i * 2);
            db.Jobs.Add(seedJobs[i]);
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsureCommunitiesAsync(AppDbContext db, List<ApplicationUser> studentUsers, List<ApplicationUser> employerUsers)
    {
        var seedCommunities = new[]
        {
            (Name: "BetterLink Demo Community", Description: "A starter community for testing posts and chat."),
            (Name: "Internship Hunters Jamaica", Description: "Share internship leads, interview tips, and preparation resources."),
            (Name: "Campus Innovators Hub", Description: "Discuss ideas, projects, and startup opportunities across campuses.")
        };

        var communities = new List<Community>();
        for (var i = 0; i < seedCommunities.Length; i++)
        {
            var seed = seedCommunities[i];
            var community = await db.Communities.FirstOrDefaultAsync(c => c.Name == seed.Name);
            if (community is null)
            {
                var owner = studentUsers[i % studentUsers.Count];
                community = new Community
                {
                    Name = seed.Name,
                    Description = seed.Description,
                    CreatedByUserId = owner.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-i * 3),
                    UpdatedAt = DateTime.UtcNow
                };
                db.Communities.Add(community);
                await db.SaveChangesAsync();
            }

            communities.Add(community);
        }

        foreach (var community in communities)
        {
            foreach (var user in studentUsers.Concat(employerUsers))
            {
                var hasMember = await db.CommunityMembers.AnyAsync(cm => cm.CommunityId == community.Id && cm.UserId == user.Id);
                if (!hasMember)
                {
                    db.CommunityMembers.Add(new CommunityMember
                    {
                        CommunityId = community.Id,
                        UserId = user.Id,
                        Role = "member",
                        JoinedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await db.SaveChangesAsync();

        foreach (var community in communities)
        {
            var hasMessage = await db.CommunityMessages.AnyAsync(m => m.CommunityId == community.Id);
            if (hasMessage)
            {
                continue;
            }

            db.CommunityMessages.AddRange(
                new CommunityMessage
                {
                    CommunityId = community.Id,
                    SenderUserId = studentUsers[0].Id,
                    Body = $"Welcome to {community.Name}!"
                },
                new CommunityMessage
                {
                    CommunityId = community.Id,
                    SenderUserId = employerUsers[0].Id,
                    Body = "Happy to connect with everyone here."
                }
            );
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsureFollowsAsync(AppDbContext db, List<ApplicationUser> studentUsers, List<ApplicationUser> employerUsers)
    {
        var pairs = new List<(long follower, long following)>
        {
            (studentUsers[0].Id, employerUsers[0].Id),
            (studentUsers[1].Id, employerUsers[0].Id),
            (studentUsers[2].Id, employerUsers[1].Id),
            (employerUsers[1].Id, studentUsers[0].Id),
            (studentUsers[0].Id, studentUsers[1].Id)
        };

        foreach (var (follower, following) in pairs)
        {
            if (follower == following)
            {
                continue;
            }

            var exists = await db.UserFollows.AnyAsync(f => f.FollowerId == follower && f.FollowingId == following);
            if (!exists)
            {
                db.UserFollows.Add(new UserFollow
                {
                    FollowerId = follower,
                    FollowingId = following,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsurePostsAsync(AppDbContext db, List<ApplicationUser> studentUsers, List<ApplicationUser> employerUsers)
    {
        var seedPosts = new[]
        {
            (UserId: studentUsers[0].Id, Content: "Excited to apply for summer internships this week!"),
            (UserId: studentUsers[1].Id, Content: "Anyone has tips for API interview questions?"),
            (UserId: employerUsers[0].Id, Content: "We are opening new internship slots for backend engineering."),
            (UserId: studentUsers[2].Id, Content: "Just completed a portfolio refresh with my latest projects."),
            (UserId: employerUsers[1].Id, Content: "Looking for students interested in QA automation and test design."),
            (UserId: employerUsers[2].Id, Content: "Remote opportunities available for frontend trainees.")
        };

        foreach (var seed in seedPosts)
        {
            var exists = await db.Posts.AnyAsync(p => p.UserId == seed.UserId && p.Content == seed.Content);
            if (!exists)
            {
                db.Posts.Add(new Post
                {
                    UserId = seed.UserId,
                    Content = seed.Content,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsureDirectMessagesAsync(AppDbContext db, List<ApplicationUser> studentUsers, List<ApplicationUser> employerUsers)
    {
        var hasThread = await db.DirectMessages.AnyAsync(m => m.SenderId == studentUsers[0].Id && m.RecipientId == employerUsers[0].Id);
        if (hasThread)
        {
            return;
        }

        db.DirectMessages.AddRange(
            new DirectMessage
            {
                SenderId = studentUsers[0].Id,
                RecipientId = employerUsers[0].Id,
                Body = "Hello, I am interested in your mobile internship role.",
                CreatedAt = DateTime.UtcNow.AddMinutes(-40)
            },
            new DirectMessage
            {
                SenderId = employerUsers[0].Id,
                RecipientId = studentUsers[0].Id,
                Body = "Great, please share your availability for a short call.",
                CreatedAt = DateTime.UtcNow.AddMinutes(-20)
            },
            new DirectMessage
            {
                SenderId = studentUsers[1].Id,
                RecipientId = employerUsers[1].Id,
                Body = "Hi, I just submitted my application. Thanks for reviewing.",
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task EnsureSampleApplicationsAsync(AppDbContext db, List<ApplicationUser> studentUsers)
    {
        var jobs = await db.Jobs.OrderBy(j => j.Id).Take(4).ToListAsync();
        for (var i = 0; i < jobs.Count; i++)
        {
            var student = studentUsers[i % studentUsers.Count];
            var job = jobs[i];
            var exists = await db.JobApplications.AnyAsync(a => a.JobId == job.Id && a.StudentUserId == student.Id);
            if (exists)
            {
                continue;
            }

            db.JobApplications.Add(new JobApplication
            {
                JobId = job.Id,
                StudentUserId = student.Id,
                CoverLetter = "I am excited to contribute to this role and grow with your team.",
                Status = i % 2 == 0 ? "submitted" : "reviewed",
                AppliedAt = DateTime.UtcNow.AddDays(-i),
                UpdatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
    }
}
