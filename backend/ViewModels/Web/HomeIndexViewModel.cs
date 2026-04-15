using BetterLink.Backend.Models;

namespace BetterLink.Backend.ViewModels.Web;

public class HomeIndexViewModel
{
    public IReadOnlyList<Job> FeaturedJobs { get; init; } = [];
    public IReadOnlyList<Community> FeaturedCommunities { get; init; } = [];
}
