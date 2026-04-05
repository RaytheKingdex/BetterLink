using Microsoft.AspNetCore.Identity;

namespace BetterLink.Backend.Models;

public class ApplicationUser : IdentityUser<long>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? DisplayId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public StudentProfile? StudentProfile { get; set; }
    public EmployerProfile? EmployerProfile { get; set; }
    public ICollection<CommunityMember> CommunityMemberships { get; set; } = [];
    public ICollection<CommunityMessage> SentCommunityMessages { get; set; } = [];
    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<PostLike> PostLikes { get; set; } = [];
    public ICollection<PostComment> PostComments { get; set; } = [];
    public ICollection<UserFollow> Following { get; set; } = [];
    public ICollection<UserFollow> Followers { get; set; } = [];
    public ICollection<DirectMessage> SentMessages { get; set; } = [];
    public ICollection<DirectMessage> ReceivedMessages { get; set; } = [];
}
