using Microsoft.AspNetCore.Identity;

namespace BetterLink.Backend.Models;

public class ApplicationUser : IdentityUser<long>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public StudentProfile? StudentProfile { get; set; }
    public EmployerProfile? EmployerProfile { get; set; }
    public ICollection<CommunityMember> CommunityMemberships { get; set; } = [];
    public ICollection<CommunityMessage> SentCommunityMessages { get; set; } = [];
}
