namespace BetterLink.Backend.Models.DTOs.Search;

public class EmployerSearchResult
{
    public long UserId { get; set; }
    public string? DisplayId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
    public int ActiveJobCount { get; set; }
}
