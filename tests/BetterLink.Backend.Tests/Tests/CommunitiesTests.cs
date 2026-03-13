using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

public class CommunitiesTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CommunitiesTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterStudentAndGetTokenAsync(string fullName)
    {
        var email = $"community-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName,
            university = "NCU",
            programName = "Computer Science"
        });

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<long> CreateCommunityAsUserAsync(string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/communities", new
        {
            name = $"Community {Guid.NewGuid()}",
            description = "Community for endpoint testing"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        response.EnsureSuccessStatusCode();

        var created = await response.Content.ReadFromJsonAsync<JsonElement>();
        return created.GetProperty("id").GetInt64();
    }

    [Fact]
    public async Task CreateCommunity_Unauthenticated_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/communities", new
        {
            name = "No Auth Community"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateAndGetCommunity_AsAuthenticatedUser_Returns201Then200()
    {
        var token = await RegisterStudentAndGetTokenAsync("Community Creator");
        var communityId = await CreateCommunityAsUserAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync($"/api/communities/{communityId}");

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(communityId, body.GetProperty("id").GetInt64());
    }

    [Fact]
    public async Task GetCommunity_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/communities/1");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task JoinCommunity_AuthenticatedUser_Returns200()
    {
        var creatorToken = await RegisterStudentAndGetTokenAsync("Creator User");
        var joinerToken = await RegisterStudentAndGetTokenAsync("Joiner User");
        var communityId = await CreateCommunityAsUserAsync(creatorToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", joinerToken);

        var response = await _client.PostAsync($"/api/communities/{communityId}/join", content: null);

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task JoinCommunity_DuplicateJoin_Returns409()
    {
        var creatorToken = await RegisterStudentAndGetTokenAsync("Creator User 2");
        var joinerToken = await RegisterStudentAndGetTokenAsync("Joiner User 2");
        var communityId = await CreateCommunityAsUserAsync(creatorToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", joinerToken);

        await _client.PostAsync($"/api/communities/{communityId}/join", content: null);
        var duplicate = await _client.PostAsync($"/api/communities/{communityId}/join", content: null);

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task CreateMessage_NotMember_Returns403()
    {
        var creatorToken = await RegisterStudentAndGetTokenAsync("Creator User 3");
        var outsiderToken = await RegisterStudentAndGetTokenAsync("Outsider User");
        var communityId = await CreateCommunityAsUserAsync(creatorToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", outsiderToken);

        var response = await _client.PostAsJsonAsync($"/api/communities/{communityId}/messages", new
        {
            body = "Should fail because not a member"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateMessage_Member_Returns200()
    {
        var creatorToken = await RegisterStudentAndGetTokenAsync("Creator User 4");
        var memberToken = await RegisterStudentAndGetTokenAsync("Member User");
        var communityId = await CreateCommunityAsUserAsync(creatorToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", memberToken);

        await _client.PostAsync($"/api/communities/{communityId}/join", content: null);
        var response = await _client.PostAsJsonAsync($"/api/communities/{communityId}/messages", new
        {
            body = "Hello community"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
