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
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<PostMedia> PostMedia => Set<PostMedia>();
    public DbSet<PostComment> PostComments => Set<PostComment>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();
    public DbSet<DirectMessage> DirectMessages => Set<DirectMessage>();

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
        builder.Entity<Post>().ToTable("posts");
        builder.Entity<PostLike>().ToTable("post_likes");
        builder.Entity<PostMedia>().ToTable("post_media");
        builder.Entity<UserFollow>().ToTable("user_follows");
        builder.Entity<DirectMessage>().ToTable("direct_messages");

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

        builder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PostLike>()
            .HasOne(pl => pl.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(pl => pl.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PostLike>()
            .HasOne(pl => pl.User)
            .WithMany(u => u.PostLikes)
            .HasForeignKey(pl => pl.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PostMedia>()
            .HasOne(pm => pm.Post)
            .WithMany(p => p.Media)
            .HasForeignKey(pm => pm.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PostComment>().ToTable("post_comments");
        builder.Entity<PostComment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<PostComment>()
            .HasOne(c => c.User)
            .WithMany(u => u.PostComments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<PostComment>().HasIndex(c => c.PostId);

        builder.Entity<PostLike>().HasIndex(pl => new { pl.PostId, pl.UserId }).IsUnique();
        builder.Entity<Post>().HasIndex(p => p.CreatedAt);
        builder.Entity<Post>().HasIndex(p => p.UserId);
        builder.Entity<PostMedia>().HasIndex(pm => pm.PostId);

        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.DisplayId)
            .IsUnique();

        builder.Entity<Job>().HasIndex(j => j.EmployerId);
        builder.Entity<Job>().HasIndex(j => j.PostedDate);
        builder.Entity<Job>().HasIndex(j => j.Status);
        builder.Entity<JobApplication>().HasIndex(a => a.JobId);
        builder.Entity<JobApplication>().HasIndex(a => a.StudentUserId);
        builder.Entity<JobApplication>().HasIndex(a => new { a.JobId, a.StudentUserId }).IsUnique();
        builder.Entity<CommunityMember>().HasIndex(cm => new { cm.CommunityId, cm.UserId }).IsUnique();
        builder.Entity<CommunityMessage>().HasIndex(m => new { m.CommunityId, m.CreatedAt });

        builder.Entity<UserFollow>()
            .HasOne(f => f.Follower)
            .WithMany(u => u.Following)
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserFollow>()
            .HasOne(f => f.Following)
            .WithMany(u => u.Followers)
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserFollow>()
            .HasIndex(f => new { f.FollowerId, f.FollowingId })
            .IsUnique();

        builder.Entity<DirectMessage>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<DirectMessage>()
            .HasOne(m => m.Recipient)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<DirectMessage>()
            .HasIndex(m => new { m.SenderId, m.RecipientId, m.CreatedAt });

        builder.Entity<DirectMessage>()
            .HasIndex(m => m.RecipientId);
    }
}
