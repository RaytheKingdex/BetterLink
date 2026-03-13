using BetterLink.Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BetterLink.Backend.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<long>, long>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<EmployerProfile> EmployerProfiles => Set<EmployerProfile>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Community> Communities => Set<Community>();
    public DbSet<CommunityMember> CommunityMembers => Set<CommunityMember>();
    public DbSet<CommunityMessage> CommunityMessages => Set<CommunityMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<StudentProfile>().ToTable("student_profiles");
        builder.Entity<EmployerProfile>().ToTable("employers");
        builder.Entity<Job>().ToTable("jobs");
        builder.Entity<JobApplication>().ToTable("applications");
        builder.Entity<Community>().ToTable("communities");
        builder.Entity<CommunityMember>().ToTable("community_members");
        builder.Entity<CommunityMessage>().ToTable("messages");

        builder.Entity<ApplicationUser>()
            .HasOne(u => u.StudentProfile)
            .WithOne(s => s.User)
            .HasForeignKey<StudentProfile>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ApplicationUser>()
            .HasOne(u => u.EmployerProfile)
            .WithOne(e => e.User)
            .HasForeignKey<EmployerProfile>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Job>()
            .HasOne(j => j.Employer)
            .WithMany(e => e.Jobs)
            .HasForeignKey(j => j.EmployerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<JobApplication>()
            .HasOne(a => a.Job)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<JobApplication>()
            .HasOne(a => a.StudentUser)
            .WithMany()
            .HasForeignKey(a => a.StudentUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Community>()
            .HasOne(c => c.CreatedBy)
            .WithMany()
            .HasForeignKey(c => c.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CommunityMember>()
            .HasOne(cm => cm.Community)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.CommunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CommunityMember>()
            .HasOne(cm => cm.User)
            .WithMany(u => u.CommunityMemberships)
            .HasForeignKey(cm => cm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CommunityMessage>()
            .HasOne(m => m.Community)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.CommunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CommunityMessage>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentCommunityMessages)
            .HasForeignKey(m => m.SenderUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Job>().HasIndex(j => j.EmployerId);
        builder.Entity<Job>().HasIndex(j => j.PostedDate);
        builder.Entity<Job>().HasIndex(j => j.Status);
        builder.Entity<JobApplication>().HasIndex(a => a.JobId);
        builder.Entity<JobApplication>().HasIndex(a => a.StudentUserId);
        builder.Entity<JobApplication>().HasIndex(a => new { a.JobId, a.StudentUserId }).IsUnique();
        builder.Entity<CommunityMember>().HasIndex(cm => new { cm.CommunityId, cm.UserId }).IsUnique();
        builder.Entity<CommunityMessage>().HasIndex(m => new { m.CommunityId, m.CreatedAt });
    }
}
