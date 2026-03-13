using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

public class UsersTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<(string Token, string Email)> RegisterStudentAsync()
    {
        var email = $"user-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Alice Student",
            university = "NCU",
            programName = "CS"
        });
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return (auth!.Token, email);
    }

    // ─── GET /api/users/me ────────────────────────────────────────────────────

    [Fact]
    public async Task GetMe_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_Authenticated_Returns200WithCorrectEmail()
    {
        var (token, email) = await RegisterStudentAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/users/me");

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(email, body.GetProperty("email").GetString());
        // Should have the Student role
        var roles = body.GetProperty("roles").EnumerateArray().Select(r => r.GetString()).ToList();
        Assert.Contains("Student", roles);
    }

    // ─── PUT /api/users/me ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateMe_Unauthenticated_Returns401()
    {
        var response = await _client.PutAsJsonAsync("/api/users/me", new
        {
            firstName = "Updated"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateMe_Authenticated_Returns204()
    {
        var (token, _) = await RegisterStudentAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PutAsJsonAsync("/api/users/me", new
        {
            firstName = "UpdatedFirst",
            lastName = "UpdatedLast"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task UpdateMe_ThenGetMe_ReflectsNewName()
    {
        var (token, _) = await RegisterStudentAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        await _client.PutAsJsonAsync("/api/users/me", new
        {
            firstName = "ChangedFirst",
            lastName = "ChangedLast"
        });

        var getResponse = await _client.GetAsync("/api/users/me");
        var body = await getResponse.Content.ReadFromJsonAsync<JsonElement>();

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal("ChangedFirst", body.GetProperty("firstName").GetString());
        Assert.Equal("ChangedLast", body.GetProperty("lastName").GetString());
    }
}
