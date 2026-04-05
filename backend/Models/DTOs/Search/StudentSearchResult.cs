namespace BetterLink.Backend.Models.DTOs.Search;

public class StudentSearchResult
{
    public long UserId { get; set; }
    public string? DisplayId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public int? GraduationYear { get; set; }
    public string? Skills { get; set; }
}
